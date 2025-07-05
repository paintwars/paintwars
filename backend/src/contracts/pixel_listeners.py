from typing import Any, Tuple
from datetime import datetime, timezone
import asyncio
from sqlalchemy.ext.asyncio.session import AsyncSession
from sqlalchemy.util import b

from src.ai.placement.init import update_grid
from src.models.session import async_session
from src.models.key_value.key_value_crud import KEYVALUE
from src.models.paintwars.pixel_event.pixel_event_crud import (
    PIXEL_EVENTS,
    PixelEventCreate,
)
from src.api.deps import get_db
from src.models.paintwars.pixel.pixel_crud import PIXELS, PixelCreate

from .provider import pixel_staking_contract, provider

LAST_INDEXED_BLOCK_FOR_EVENTS = "lastIndexedBlockForEvents"

async def propagate_pixel_event(dbEvent: PixelEventCreate, db: AsyncSession):
    pixel = PixelCreate(
        id=dbEvent.pixel_id,
        owner=dbEvent.owner.lower(),
        color=dbEvent.color,
        stake_amount=dbEvent.stake_amount,
        effective_stake_amount=dbEvent.effective_stake_amount,
        hash=dbEvent.hash,  # type: ignore
    )
    await PIXELS.create(
        db,
        obj_in=pixel,
    )
    update_grid(pixel)


async def parse_pixel_changed_event(event: Any, db: AsyncSession):
    print("new event: ", event, flush=True)
    block = await provider.eth.get_block(event["blockNumber"])
    block_timestamp = block["timestamp"] if "timestamp" in block else 0

    timestamp = datetime.utcfromtimestamp(block_timestamp)

    event_data = event["args"]
    dbEvent = PixelEventCreate(
        chain_id=1,
        pixel_id=event_data["pixelId"],
        owner=event_data["staker"].lower(),
        stake_amount=event_data["amount"],
        effective_stake_amount=event_data["effectiveAmount"],
        color=event_data["color"],
        log_index=event["logIndex"],
        token_address=event_data["token_address"].lower(),
        hash=f"0x{event["transactionHash"].hex().lower()}",
        timestamp=datetime.utcfromtimestamp(block_timestamp),
    )
    await PIXEL_EVENTS.create(db, obj_in=dbEvent)
    await propagate_pixel_event(dbEvent, db)


# async def parse_spell_applied_event(event: Any, db: AsyncSession):
#     print("new event: ", event, flush=True)
#     block = await provider.eth.get_block(event["blockNumber"])
#     block_timestamp = block["timestamp"] if "timestamp" in block else 0

#     event_data = event["args"]
#     pixelIds = event_data["pixelIds"]
#     timestamp = datetime.utcfromtimestamp(block_timestamp)
#     hash = f"0x{event["transactionHash"].hex().lower()}"
#     log_index = event["logIndex"]
#     nbrPixels = len(pixelIds)
#     for i in range(nbrPixels):
#         dbEvent = PixelEventCreate(
#             pixel_id=pixelIds[i],
#             log_index=log_index,
#             hash=hash,
#             timestamp=timestamp,
#         )
#         await PIXEL_EVENTS.create(db, obj_in=dbEvent)
#         await propagate_pixel_event(dbEvent, db)

async def parse_pixel_events(events: list[Any], db) -> str | None:
    if len(events) > 0:
        events.sort(key=lambda e: (e["blockNumber"], e["logIndex"]))
        for event in events:
            if event["event"] == "PixelChanged":
                await parse_pixel_changed_event(event, db)
            # elif event["event"] == "SpellApplied":
            #     await parse_spell_applied_event(event, db)
        latest = events[-1]
        latest_block = latest["blockNumber"] + 1
        await KEYVALUE.set(
            db, key=LAST_INDEXED_BLOCK_FOR_EVENTS, value=str(latest_block)
        )
        return latest_block

async def create_event_filters(from_block: int) -> list[Any]:
    print("creating event filters for ", from_block, flush=True)
    px_changed_event_filter = (
        await pixel_staking_contract.events.PixelChanged.create_filter(
            from_block=from_block
        )
    )
    # sp_applied_event_filter = (
    #     await pixel_staking_contract.events.SpellApplied.create_filter(
    #         from_block=from_block
    #     )
    # )
    return [
        px_changed_event_filter,
        # sp_applied_event_filter,
    ]


async def extract_events(filters: list[Any], onlyNew: bool = True) -> list[Any]:
    events = []
    for filter in filters:
        if onlyNew:
            evs = await filter.get_new_entries()
        else:
            evs = await filter.get_all_entries()
        for ev in evs:
            events.append(ev)
    return events


async def catchup(db: AsyncSession) -> int:
    from_block_key_value = await KEYVALUE.get(db, key=LAST_INDEXED_BLOCK_FOR_EVENTS)
    fallback = await provider.eth.get_block_number()
    from_block = (
        int(from_block_key_value.value)
        if from_block_key_value is not None and from_block_key_value != ""
        else 0
    )

    # from_block = 1175465 if from_block < 1175455 else from_block
    event_filters = await create_event_filters(from_block)

    events = await extract_events(event_filters, False)
    await parse_pixel_events(events, db)
    return from_block


async def listen_to_pixels_events_loop():
    print("starting to listen to pixel events", flush=True)
    async with async_session() as db:
        latest_block = await catchup(db)
        event_filters = await create_event_filters(latest_block)
        while True:
            events = await extract_events(event_filters)
            latest_block = await parse_pixel_events(events, db)

            await asyncio.sleep(2)
