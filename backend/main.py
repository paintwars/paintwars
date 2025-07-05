from os import path
from fastapi import FastAPI
from starlette.middleware.cors import CORSMiddleware
import asyncio

from src.core.config import config
from src.api import api_router
from src.contracts.provider import provider_connect
from backend.src.contracts.pixel_listeners import listen_to_pixels_events_loop

app = FastAPI()

if config.CORS_ORIGINS:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[str(origin) for origin in config.CORS_ORIGINS],
        allow_credentials=True,
        allow_methods=["GET", "POST", "PUT", "DELETE"],
        allow_headers=["*"],
    )

app.include_router(api_router, prefix=config.API_PREFIX)

@app.on_event("startup")
async def startup_event():
    await provider_connect()
    asyncio.create_task(listen_to_pixels_events_loop())
