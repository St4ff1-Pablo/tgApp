import asyncio,logging,sys
 
from aiogram.filters.command import Command
from aiogram import Bot, Dispatcher, types
from aiogram.types import Message, InlineKeyboardButton, InlineKeyboardMarkup

from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy.ext.asyncio import AsyncSession,async_sessionmaker

from referrals.bot.handlers import setup_routers
from referrals.bot.middlewares import DBSessionMiddleware
from referrals.db.models import Mission

from referrals.db import Base
from referrals.config_reader import config

from sqlalchemy import select

bot = Bot(config.BOT_TOKEN.get_secret_value())
dp = Dispatcher()


_engine = create_async_engine(config.DB_URL.get_secret_value(),echo=True)
_sessionmaker = async_sessionmaker(_engine,expire_on_commit=False)


dp.message.middleware(DBSessionMiddleware(_sessionmaker))
dp.include_router(setup_routers())



async def initialize_missions():
    """ Add predefined missions to the database if they don't exist. """
    async with _sessionmaker() as session:
        existing_missions = await session.execute(select(Mission.id))
        if not existing_missions.scalars().all():
            # Insert sample missions
            missions = [
                Mission(name="Complete First Task", description="Finish your first task", reward_coins=50,reward_gems=10),
                Mission(name="Invite a Friend", description="Refer someone to the bot",reward_coins=50, reward_gems=20),
                Mission(name="Reach Level 5", description="Upgrade to level 5", reward_coins=50,reward_gems=20),
            ]
            session.add_all(missions)
            await session.commit()


@dp.startup()
async def on_startup() -> None:
    await bot.delete_webhook(True)

    async with _engine.begin() as connection:
        await connection.run_sync(Base.metadata.create_all)
    await initialize_missions()
@dp.shutdown()
async def on_shutdown(dp:Dispatcher,session:AsyncSession) -> None:
    await session.close()
dp.shutdown.register(on_shutdown)



if __name__ == '__main__':
    logging.basicConfig(level=logging.INFO,stream=sys.stdout)
    try:
        asyncio.run(dp.start_polling(bot))
    except KeyboardInterrupt:
        print("Shutting down")