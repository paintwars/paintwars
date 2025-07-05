from typing import Any
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import APIRouter, Depends

from src.models.paintwars.pixel.pixel_crud import PIXELS
from src.models.paintwars.pixel.pixel_schema import PixelInDB
from src.api.deps import get_db

router = APIRouter()


@router.get("/", response_model=list[PixelInDB])
async def read_pixels(db: AsyncSession = Depends(get_db)) -> Any:
    pixels = await PIXELS.get_many(db)
    return pixels
