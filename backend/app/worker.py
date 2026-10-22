"""Run `python -m app.worker` on a persistent host, or `--once` from a scheduler."""
import argparse
import asyncio
import logging
from app.core.config import get_settings
from app.core.database import db_manager
from app.services.automation_service import AutomationEngine, ensure_automation


async def main(once=False):
    await db_manager.connect(get_settings())
    if not db_manager.is_connected:
        raise RuntimeError("Worker requires a configured, connected MongoDB database")
    db = db_manager.database
    await ensure_automation(db)
    engine = AutomationEngine(db)
    try:
        while True:
            await engine.tick()
            await db["worker_health"].update_one({"_id": "automation"}, {"$currentDate": {"heartbeat": True}}, upsert=True)
            if once:
                break
            await asyncio.sleep(5)
    finally:
        await db_manager.disconnect()


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--once", action="store_true")
    logging.basicConfig(level=logging.INFO)
    asyncio.run(main(parser.parse_args().once))
