from web3 import AsyncWeb3
from web3.providers import WebSocketProvider

from src.core.config import config

provider = AsyncWeb3(WebSocketProvider(config.RPC_URL))

async def provider_connect():
    await provider.provider.connect()