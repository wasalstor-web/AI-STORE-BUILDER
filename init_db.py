#!/usr/bin/env python3
"""
Initialize database with all tables.
Run: python init_db.py
"""
import asyncio

from app.database import engine
from app.models import Base  # Imports all models


async def init_tables():
    """Create all tables defined in models."""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    print("✅ Database initialized successfully!")


if __name__ == "__main__":
    asyncio.run(init_tables())
