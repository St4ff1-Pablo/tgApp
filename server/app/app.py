from fastapi import FastAPI, HTTPException, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List

# Import models from the referrals.db package
from referrals.db.models import User, Referral
from referrals.bot.middlewares.db_session import DBSessionMiddleware
from pydantic import BaseModel

app = FastAPI()

# Pydantic model for response
class UserResponse(BaseModel):
    id: int
    name: str
    coins: int
    gems: int
    level: int
    referrals: List[int]  # List of referral ids for simplicity

    class Config:
        from_attributes = True  # Ensure correct model conversion from SQLAlchemy

# Dependency to get the DB session, using async session
async def get_db_session(session: AsyncSession = Depends(DBSessionMiddleware)):
    return session

# Endpoint to fetch user data by user_id
@app.get("/users/710934564", response_model=UserResponse)
async def get_user(user_id: int, session: AsyncSession = Depends(get_db_session)):
    # Query the database for the user
    result = await session.execute(select(User).filter(User.id == user_id))
    user = result.scalars().first()  # Get the first matching user

    if user is None:
        raise HTTPException(status_code=404, detail="User not found")

    # Return user data
    referrals_ids = [referral.referral_id for referral in user.referrals]
    return UserResponse(
        id=user.id,
        name=user.name,
        coins=user.coins,
        gems=user.gems,
        level=user.level,
        referrals=referrals_ids
    )


    




