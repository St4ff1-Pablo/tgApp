from sqlalchemy import Integer,BigInteger,ForeignKey, String,Boolean,DateTime,func
from sqlalchemy.orm import mapped_column , relationship
from .base import Base

class User(Base):
    __tablename__='users'
    id=mapped_column(BigInteger,primary_key=True)
    referrals=relationship('Referral',back_populates='user',foreign_keys='Referral.user_id')
    coins=mapped_column(BigInteger,default=0)
    gems=mapped_column(BigInteger,default=0)
    level=mapped_column(Integer,default=1)
    name = mapped_column(String, nullable=False, default=lambda ctx: f"User_{ctx.get_current_parameters()['id']}")
    missions = relationship('UserMission', back_populates='user', lazy='joined')


class Referral(Base): 
    __tablename__='referrals'
    id=mapped_column(BigInteger,primary_key=True)
    user_id=mapped_column(BigInteger, ForeignKey('users.id'))
    referral_id=mapped_column(BigInteger, ForeignKey('users.id'))  # Добавляем ForeignKey

    user = relationship('User', back_populates='referrals', foreign_keys=[user_id])
    referral_user = relationship('User', foreign_keys=[referral_id])


class UserMission(Base):
    """ Table for tracking which missions a user has completed. """
    __tablename__ = 'user_missions'
    
    id = mapped_column(BigInteger, primary_key=True)
    user_id = mapped_column(BigInteger, ForeignKey('users.id'))
    mission_id = mapped_column(BigInteger, ForeignKey('missions.id'))
    completed = mapped_column(Boolean, default=False)
    completed_at = mapped_column(DateTime, nullable=True)

    user = relationship('User', back_populates='missions')
    mission = relationship('Mission')


class Mission(Base):
    """ Table for storing all predefined missions. """
    __tablename__ = 'missions'
    
    id = mapped_column(BigInteger, primary_key=True)
    name = mapped_column(String, unique=True, nullable=False)
    description = mapped_column(String, nullable=False)
    reward_coins = mapped_column(Integer, default=0) 
    reward_gems = mapped_column(Integer, default=0)
