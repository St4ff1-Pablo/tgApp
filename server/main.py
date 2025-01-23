import asyncio,logging,sys
 
from aiogram.filters.command import Command
from aiogram import Bot, Dispatcher, types
from aiogram.types import Message, InlineKeyboardButton, InlineKeyboardMarkup

from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy.ext.asyncio import AsyncSession,async_sessionmaker

from referrals.bot.handlers import setup_routers
from referrals.bot.middlewares import DBSessionMiddleware

from referrals.db import Base
from referrals.config_reader import config

bot = Bot(config.BOT_TOKEN.get_secret_value())
dp = Dispatcher()


_engine = create_async_engine(config.DB_URL.get_secret_value(),echo=True)
_sessionmaker = async_sessionmaker(_engine,expire_on_commit=False)


dp.message.middleware(DBSessionMiddleware(_sessionmaker))
dp.include_router(setup_routers())

@dp.startup()
async def on_startup() -> None:
    await bot.delete_webhook(True)

    async with _engine.begin() as connection:
        await connection.run_sync(Base.metadata.create_all)
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