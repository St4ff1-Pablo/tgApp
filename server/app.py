import sys
import os

# Add the root directory of the project to sys.path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
    

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
def get_session() -> AsyncSession:
    # This should return your actual session
    pass

# Endpoint to fetch user data by user_id
@app.get("/users/{user_id}", response_model=UserResponse)
async def get_user(user_id: int, session: AsyncSession = Depends(get_session)):
    # Fetch the user from the database using the SQLAlchemy async session
    result = await session.execute(select(User).filter(User.id == user_id))
    user = result.scalars().first()

    if user is None:
        raise HTTPException(status_code=404, detail="User not found")

    # Return the User object as a Pydantic model
    return user  # FastAPI will convert this to UserResponse based on the response_model