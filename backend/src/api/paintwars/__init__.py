from fastapi import APIRouter
from . import pixels, pixel_events

router = APIRouter()

router.include_router(pixels.router, prefix="/pixels", tags=["pixels"])
router.include_router(pixel_events.router, prefix="/pixelEvents", tags=["pixelEvents"])