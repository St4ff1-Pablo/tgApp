from sqlalchemy import Integer,BigInteger,ForeignKey, String
from sqlalchemy.orm import mapped_column , relationship
from .base import Base

class User(Base):
    __tablename__='users'
    id=mapped_column(BigInteger,primary_key=True)
    referrals=relationship('Referral',back_populates='user',foreign_keys='Referral.user_id')
    coins=mapped_column(BigInteger,default=0)
    gems=mapped_column(BigInteger,default=0)
    level=mapped_column(Integer,default=1)
    name=mapped_column(String)


class Referral(Base): 
    __tablename__='referrals'
    id=mapped_column(BigInteger,primary_key=True)
    user_id=mapped_column(BigInteger,ForeignKey('users.id'))
    referral_id=mapped_column(BigInteger)

    user = relationship('User',back_populates='referrals',foreign_keys=[user_id])

