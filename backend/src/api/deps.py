from collections.abc import Generator
from typing import AsyncGenerator

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import Session

from src.core import security
from src.core.config import config
from src.models.session import async_session
from src.models.token_schema import TokenPayload

async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with async_session() as session:
        yield session