from fastapi import APIRouter

from . import paintwars

api_router = APIRouter()
api_router.include_router(paintwars.router, prefix="/paintwars", tags=["paintwars"])
