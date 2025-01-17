from typing import Any

from aiogram.enums import ParseMode
from aiogram import Router,F
from aiogram.types import Message
from aiogram.filters import CommandStart, CommandObject
from aiogram import types
from aiogram.utils.keyboard import InlineKeyboardBuilder

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select,or_

from referrals.db import User,Referral

router = Router()

@router.message(CommandStart())
async def start(message: Message, command: CommandObject, session: AsyncSession) -> Any:
    user = await session.scalar(select(User).where(User.id == message.from_user.id))

    builder = InlineKeyboardBuilder()
    builder.add(types.InlineKeyboardButton(
        text="DFT Chat",
        url="https://t.me/+bd_GRfqporxjNDEy"
    ))
    builder.add(types.InlineKeyboardButton(
        text="DFT Channel",
        url="https://t.me/dftproject"
    ))
    builder.add(types.InlineKeyboardButton(
        text="Get Your Referral Link",
        callback_data="ref_link"
    ))

    if not user:
        user = User(id=message.from_user.id)
        session.add(user)
        await session.commit()

    if command.args:
        option, value = command.args.split('_')
        match option:
            case 'r':
                try:
                    inviter_id = int(value)
                except ValueError:
                    return None

                if inviter_id == user.id:
                    # Prevent users from referring themselves
                    return await message.answer("You cannot use your own referral link.")

                inviter = await session.scalar(select(User).where(User.id == inviter_id))
                if not inviter:
                    return None  # Inviter does not exist

                # Check if this referral already exists
                existing_referral = await session.scalar(
                    select(Referral).where(
                        Referral.user_id == inviter.id,
                        Referral.referral_id == user.id
                    )
                )
                if existing_referral:
                    return await message.answer("You are already referred by this user.")

                # Add the new referral
                session.add(Referral(user_id=inviter.id, referral_id=user.id))
                await session.commit()

                await message.bot.send_message(
                    chat_id=inviter.id,
                    text=f"User {user.id} became your referral!"
                )
                return await message.answer(f"You are now referred by user {inviter_id}.")
            
    return await message.answer("Thank you for using our bot.\nUseful links:", reply_markup=builder.as_markup())

@router.callback_query(F.data == "ref_link")
async def send_refLink(callback: types.CallbackQuery):
    me = await callback.bot.get_me()
    referral_link = f'https://t.me/{me.username}?start=r_{callback.from_user.id}'
    await callback.message.answer(
        f"Here is your referral link:\n<code>{referral_link}</code>",
        parse_mode=ParseMode.HTML
    )

