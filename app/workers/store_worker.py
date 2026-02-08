"""
ARQ Worker — processes store generation jobs in the background.
Runs as a separate container (docker-compose worker service).
"""

import asyncio
from datetime import UTC, datetime

from arq import func
from arq.connections import RedisSettings
from sqlalchemy import update

from app.config import get_settings
from app.database import async_session_factory
from app.models.job import Job
from app.models.store import Store
from app.services.store_generator import generate_store

settings = get_settings()


def parse_redis_url(url: str) -> RedisSettings:
    """Parse redis://host:port/db into RedisSettings."""
    url = url.replace("redis://", "")
    parts = url.split("/")
    host_port = parts[0].split(":")
    host = host_port[0]
    port = int(host_port[1]) if len(host_port) > 1 else 6379
    database = int(parts[1]) if len(parts) > 1 else 0
    return RedisSettings(host=host, port=port, database=database)


async def process_store_generation(ctx: dict, job_id: str, store_id: str, config: dict):
    """
    Main worker function — simulates AI store generation with progress updates.
    In Phase 2, replace with real LLM calls.
    """
    print(f"🏗️ Starting store generation: job={job_id}, store={store_id}")

    async with async_session_factory() as db:
        # Mark job as running
        await db.execute(
            update(Job)
            .where(Job.id == job_id)
            .values(status="running", started_at=datetime.now(UTC), progress=0)
        )
        await db.commit()

        try:
            # Get generation steps
            steps, result = await generate_store(job_id, store_id, config)

            # Simulate progress through each step
            for step_msg, progress in steps:
                print(f"  📦 [{progress}%] {step_msg}")

                await db.execute(update(Job).where(Job.id == job_id).values(progress=progress))
                await db.commit()

                # Simulate work (2 seconds per step)
                await asyncio.sleep(2)

            # Mark store as active
            await db.execute(update(Store).where(Store.id == store_id).values(status="active"))

            # Mark job as done
            await db.execute(
                update(Job)
                .where(Job.id == job_id)
                .values(
                    status="done",
                    progress=100,
                    result=result,
                    completed_at=datetime.now(UTC),
                )
            )
            await db.commit()

            print(f"✅ Store generation complete: job={job_id}")
            return result

        except Exception as e:
            # Mark job as failed
            await db.execute(
                update(Job)
                .where(Job.id == job_id)
                .values(
                    status="failed",
                    error=str(e),
                    completed_at=datetime.now(UTC),
                )
            )
            await db.commit()
            print(f"❌ Store generation failed: job={job_id}, error={e}")
            raise


async def startup(ctx: dict):
    """Worker startup — called once when worker starts."""
    print("⚙️ ARQ Worker started — listening for store generation jobs...")


async def shutdown(ctx: dict):
    """Worker shutdown — cleanup."""
    print("👋 ARQ Worker shutting down...")


class WorkerSettings:
    """ARQ Worker configuration."""

    functions = [func(process_store_generation, name="process_store_generation")]  # noqa: RUF012
    on_startup = startup
    on_shutdown = shutdown
    redis_settings = parse_redis_url(settings.REDIS_URL)
    max_jobs = 5
    job_timeout = 300  # 5 minutes max per job
    keep_result = 3600  # Keep results for 1 hour
    health_check_interval = 30


if __name__ == "__main__":
    import arq.worker

    arq.worker.run_worker(WorkerSettings)  # type: ignore
