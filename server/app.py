import logging
from main import _sessionmaker as async_session
from fastapi import FastAPI, HTTPException, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List
from sqlalchemy.sql import func
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from main import bot

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
    # Получаем все миссии
    missions_result = await session.execute(select(Mission))
    all_missions = missions_result.scalars().all()

    # Получаем миссии пользователя
    user_missions_result = await session.execute(
        select(UserMission).where(UserMission.user_id == user_id)
    )
    user_missions = {um.mission_id: um.completed for um in user_missions_result.scalars().all()}

    # Формируем ответ, добавляя информацию о выполнении миссии, если запись существует
    missions_list = []
    for mission in all_missions:
        missions_list.append({
            "id": mission.id,
            "name": mission.name,
            "reward_coins": mission.reward_coins,
            "reward_gems": mission.reward_gems,
            "completed": user_missions.get(mission.id, False),
            "type": mission.type,
            "target_value": mission.target_value,
            "description": mission.description,
        })
    return missions_list




@app.post("/users/{user_id}/missions/{mission_id}/complete")
async def complete_mission(user_id: int, mission_id: int, session: AsyncSession = Depends(get_session)):
    """
    Завершает миссию, проводит проверку в зависимости от типа и начисляет награды.
    """
    # Получаем пользователя и миссию
    user = await session.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    mission = await session.get(Mission, mission_id)
    if not mission:
        raise HTTPException(status_code=404, detail="Mission not found")
    
    # Проверка, если миссия уже выполнена
    existing_mission_result = await session.execute(
        select(UserMission).where(UserMission.user_id == user_id, UserMission.mission_id == mission_id)
    )
    user_mission = existing_mission_result.scalars().first()
    if user_mission and user_mission.completed:
        raise HTTPException(status_code=400, detail="Mission already completed")
    
    # Проверка выполнения миссии в зависимости от её типа
    if mission.type == "subscribe":
    # Если target_value выглядит как URL, извлекаем имя канала
        channel_identifier = mission.target_value
        if channel_identifier.startswith("http"):
        # Пример простого преобразования, предполагается, что URL имеет формат https://t.me/your_channel
            channel_identifier = "@" + channel_identifier.split("t.me/")[-1]
        chat_member = await bot.get_chat_member(channel_identifier, user_id)
        if chat_member.status not in ["member", "creator", "administrator"]:
            raise HTTPException(status_code=400, detail="User is not subscribed to the Telegram channel.")
    
    elif mission.type == "level":
        required_level = int(mission.target_value)
        if user.level < required_level:
            raise HTTPException(status_code=400, detail=f"User level ({user.level}) is below required level {required_level}.")
    
    elif mission.type == "boss":
        required_boss_level = int(mission.target_value)
        # Если у пользователя уже побеждён босс с уровнем, равным или выше требуемого, миссия засчитывается
        if user.last_boss_defeated < required_boss_level:
            raise HTTPException(status_code=400, detail=f"User has not defeated a boss of level {required_boss_level}.")
    
    elif mission.type == "referral":
        required_referrals = int(mission.target_value)
        # Подсчёт количества приглашённых друзей
        referral_result = await session.execute(select(Referral).where(Referral.user_id == user_id))
        referral_count = len(referral_result.scalars().all())
        if referral_count < required_referrals:
            raise HTTPException(status_code=400, detail=f"User has invited {referral_count} friends; {required_referrals} required.")
    
    # Отмечаем миссию как выполненную
    if not user_mission:
        user_mission = UserMission(
            user_id=user.id,
            mission_id=mission.id,
            completed=True,
            completed_at=datetime.utcnow()
        )
        session.add(user_mission)
    else:
        user_mission.completed = True
        user_mission.completed_at = datetime.utcnow()
    
    # Начисляем награды
    user.coins += mission.reward_coins
    user.gems += mission.reward_gems

    await session.commit()
    return {
        "message": "Mission completed!",
        "coins_earned": mission.reward_coins,
        "gems_earned": mission.reward_gems
    }

