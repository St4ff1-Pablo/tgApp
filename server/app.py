import logging
from main import _sessionmaker as async_session
from fastapi import FastAPI, HTTPException, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from referrals.db.models import User, Referral
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

