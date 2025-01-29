from typing import Any

from aiogram.enums import ParseMode
from aiogram import Router, F
from aiogram.types import Message, WebAppInfo, InlineKeyboardMarkup, InlineKeyboardButton, MenuButtonWebApp
from aiogram.filters import CommandStart, CommandObject
from aiogram import types
from aiogram.utils.keyboard import InlineKeyboardBuilder

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from referrals.db import User, Referral
from referrals.db.models import User, Mission, UserMission

router = Router()



async def initialize_user_missions(session: AsyncSession, user_id: int):
    missions = await session.execute(select(Mission.id))
    mission_ids = missions.scalars().all()

    user_mission_objects = [
        UserMission(user_id=user_id, mission_id=mission_id, completed=False)
        for mission_id in mission_ids
    ]

    session.add_all(user_mission_objects)
    await session.commit()
    print(f"Assigned {len(user_mission_objects)} missions to user {user_id}")  # Debugging


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

    # Set the bot menu button for the user
    await message.bot.set_chat_menu_button(
        chat_id=message.chat.id,
        menu_button=MenuButtonWebApp(
            text="Bot Menu",
            web_app=WebAppInfo(url="https://2c11-158-195-195-174.ngrok-free.app")
        )
    )

    if not user:
        user = User(
        id=message.from_user.id,
        name=message.from_user.username if message.from_user.username else f"{message.from_user.first_name} {message.from_user.last_name or ''}".strip(),
        coins=0,  # Ensure default value
        gems=0   # Ensure default value
    )

        await session.flush()
        session.add(user)
        await session.commit()
        # Assign missions to new user
        await initialize_user_missions(session, user.id)
    else:
        # Update the name if it has changed
        new_name = message.from_user.username if message.from_user.username else f"{message.from_user.first_name} {message.from_user.last_name or ''}".strip()
        if user.name != new_name:
            user.name = new_name
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



