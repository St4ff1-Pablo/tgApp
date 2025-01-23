from main import _sessionmaker as async_session
from fastapi import FastAPI, HTTPException, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List
from pydantic import BaseModel

from referrals.db.models import User, Referral
from referrals.bot.middlewares.db_session import DBSessionMiddleware

app = FastAPI()

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

    if not referrals:
        raise HTTPException(status_code=404, detail="No referrals found")

    return [ReferralResponse.model_validate(ref) for ref in referrals]

