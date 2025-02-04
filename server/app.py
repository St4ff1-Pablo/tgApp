import logging
from main import _sessionmaker as async_session
from fastapi import FastAPI, HTTPException, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List
from sqlalchemy.sql import func
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from referrals.db.models import User, Referral, Mission, UserMission
from referrals.bot.middlewares.db_session import DBSessionMiddleware

from datetime import datetime,timedelta


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allowed origins
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS","PATCH"],  # Allow OPTIONS method
    allow_headers=["*"],  # Allow all headers
)



class UserResponse(BaseModel):
    id: int
    name: str
    coins: int
    gems: int
    level: int
    battle_attempts: int  # новое поле
    last_battle_update: datetime | None = None 
    

    class Config:
        from_attributes = True  # Enable conversion from ORM attributes

class ReferralResponse(BaseModel):
    id: int
    referral_id: int

    class Config:
        from_attributes = True


class UserUpdate(BaseModel):
    coins: int | None = None
    gems: int | None = None
    level: int | None = None
    battle_attempts: int | None = None
    last_battle_update: datetime | None = None

async def get_session() -> AsyncSession:
    async with async_session() as session:
        yield session


# Endpoint to fetch user data by user_id
@app.get("/users/{user_id}", response_model=UserResponse)
async def get_user(user_id: int, session: AsyncSession = Depends(get_session)):
    # Fetch the user from the database using the SQLAlchemy async session
    result = await session.execute(select(User).filter(User.id == user_id))
    user = result.scalars().first()

    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Вычисляем количество восстановленных попыток
    time_passed = (datetime.utcnow() - user.last_battle_update).total_seconds()
    recovered_attempts = int(time_passed // 1800)  # 1800 секунд = 30 минут
    if recovered_attempts > 0:
        user.battle_attempts = min(user.battle_attempts + recovered_attempts, 5)
        # Обновляем last_battle_update: прибавляем восстановленные 30-минутные интервалы
        user.last_battle_update += timedelta(seconds=1800 * recovered_attempts)
        await session.commit()

    # Use model_validate instead of from_orm
    return UserResponse.model_validate(user)

@app.get("/users/{user_id}/referrals", response_model=List[ReferralResponse])
async def get_referrals(user_id: int, session: AsyncSession = Depends(get_session)):
    result = await session.execute(select(Referral).where(Referral.user_id == user_id))
    referrals = result.scalars().all()

    return [ReferralResponse.model_validate(ref) for ref in referrals] if referrals else []  # Return empty list instead of 404


@app.patch("/users/{user_id}", response_model=UserResponse)
async def update_user(
    user_id: int, 
    update_data: UserUpdate,
    session: AsyncSession = Depends(get_session)
):
    result = await session.execute(select(User).filter(User.id == user_id))
    user = result.scalars().first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    data = update_data.dict(exclude_unset=True)
    # Если обновляется количество попыток, обновляем и время последнего обновления
    if "battle_attempts" in data:
        # При уменьшении попыток обновляем время
        if data["battle_attempts"] < user.battle_attempts:
            from datetime import datetime
            user.last_battle_update = datetime.utcnow()
        user.battle_attempts = data["battle_attempts"]
    
    # Обновляем остальные поля, если они переданы
    for field, value in data.items():
        if field not in ("battle_attempts",):
            setattr(user, field, value)
    
    await session.commit()
    return UserResponse.model_validate(user)





@app.get("/users/{user_id}/missions")
async def get_user_missions(user_id: int, session: AsyncSession = Depends(get_session)):
    """ Retrieves missions for a specific user. """
    result = await session.execute(
        select(
            Mission.id, Mission.name, Mission.description, Mission.reward_coins, Mission.reward_gems, UserMission.completed
        )
        .join(UserMission, Mission.id == UserMission.mission_id)
        .where(UserMission.user_id == user_id)
    )

    missions = result.all()

    if not missions:
        return {"message": "No missions found for this user."}  # Return friendly message

    return [
        {"id": m.id, "name": m.name, "description": m.description, "reward_coins": m.reward_coins, "reward_gems": m.reward_gems, "completed": m.completed}
        for m in missions
    ]



@app.post("/users/{user_id}/missions/{mission_id}/complete")
async def complete_mission(user_id: int, mission_id: int, session: AsyncSession = Depends(get_session)):
    """ Mark mission as completed and give rewards to user. """
    user = await session.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    mission = await session.get(Mission, mission_id)
    if not mission:
        raise HTTPException(status_code=404, detail="Mission not found")

    # Check if the mission is already completed
    existing_mission = await session.execute(
        select(UserMission)
        .where(UserMission.user_id == user_id, UserMission.mission_id == mission_id)
    )
    user_mission = existing_mission.scalars().first()

    if user_mission:
        if user_mission.completed:
            raise HTTPException(status_code=400, detail="Mission already completed")
        user_mission.completed = True
        user_mission.completed_at = datetime.utcnow()
    else:
        session.add(UserMission(user_id=user.id, mission_id=mission.id, completed=True, completed_at=datetime.utcnow()))

    # Update user's rewards
    user.coins += mission.reward_coins
    user.gems += mission.reward_gems

    await session.commit()

    return {"message": "Mission completed!", "coins_earned": mission.reward_coins, "gems_earned": mission.reward_gems}

