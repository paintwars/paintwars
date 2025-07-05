from src.models.session import async_session

async def listen_to_pixels_events_loop():
    print("starting to listen to pixel events", flush=True)
    async with async_session() as db:
        latest_block = await catchup(db)
        event_filters = await create_event_filters(latest_block)
        while True:
            events = await extract_events(event_filters)
            latest_block = await parse_pixel_events(events, db)

            await asyncio.sleep(2)