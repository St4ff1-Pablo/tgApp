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

    # Use model_validate instead of from_orm
    return UserResponse.model_validate(user)
@app.get("/users/{user_id}/referrals", response_model=List[ReferralResponse])
async def get_referrals(user_id: int, session: AsyncSession = Depends(get_session)):
    result = await session.execute(select(Referral).where(Referral.user_id == user_id))
    referrals = result.scalars().all()
    
    # Вместо 404 возвращаем пустой список, если рефералов нет
    return [ReferralResponse.model_validate(ref) for ref in referrals] if referrals else []


@app.patch("/users/{user_id}")
async def update_user(
    user_id: int, 
    update_data: UserUpdate,
    session: AsyncSession = Depends(get_session)
):
    result = await session.execute(select(User).filter(User.id == user_id))
    user = result.scalars().first()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    for field, value in update_data.dict(exclude_unset=True).items():
        setattr(user, field, value)
    
    await session.commit()
    return UserResponse.model_validate(user)



@app.get("/users/{user_id}/missions")
async def get_user_missions(user_id: int, session: AsyncSession = Depends(get_session)):
    """ Retrieves missions for a specific user. """
    result = await session.execute(
        select(
            Mission.id, Mission.name, Mission.description, Mission.reward_coins, UserMission.completed, Mission.reward_gems
        ).join(UserMission, Mission.id == UserMission.mission_id)
        .where(UserMission.user_id == user_id)
    )
    
    missions = result.all()
    return [{"id": m[0], "name": m[1], "description": m[2], "reward": m[3], "completed": m[4]} for m in missions]


@app.post("/users/{user_id}/missions/{mission_id}/complete")
async def complete_mission(user_id: int, mission_id: int, session: AsyncSession = Depends(get_session)):
    """ Mark mission as completed and give rewards to user. """
    # Check if user exists
    user = await session.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Check if mission exists
    mission = await session.get(Mission, mission_id)
    if not mission:
        raise HTTPException(status_code=404, detail="Mission not found")

    # Update user's coins and gems
    user.coins += mission.reward_coins
    user.gems += mission.reward_gems

    # Mark mission as completed (assuming you have a UserMission table)
    completed_mission = UserMission(user_id=user.id, mission_id=mission.id)
    session.add(completed_mission)

    await session.commit()
    return {"message": "Mission completed!", "coins_earned": mission.reward_coins, "gems_earned": mission.reward_gems}


