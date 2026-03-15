import os
from datetime import datetime, timezone

from rq_scheduler import Scheduler

from Delivery_app_BK import create_app
from Delivery_app_BK.services.infra.jobs.queues import get_queue_names
from Delivery_app_BK.services.infra.jobs.tasks.maintenance import (
    repair_stale_dispatch_claims_job,
    requeue_stale_message_actions_job,
)
from Delivery_app_BK.services.infra.redis import get_current_rq_redis_connection


def _ensure_periodic_job(*, scheduler: Scheduler, job_id: str, fn, interval_seconds: int, queue_name: str) -> None:
    existing_ids = {job.id for job in scheduler.get_jobs()}
    if job_id in existing_ids:
        return

    scheduler.schedule(
        scheduled_time=datetime.now(timezone.utc),
        func=fn,
        interval=interval_seconds,
        repeat=None,
        id=job_id,
        queue_name=queue_name,
    )


def main() -> None:
    config_name = os.environ.get("APP_ENV", "development")
    app = create_app(config_name)

    with app.app_context():
        connection = get_current_rq_redis_connection()
        queue_names = get_queue_names()
        scheduler = Scheduler(connection=connection, queue_name=queue_names.default)
        interval_seconds = app.config.get("REDIS_REPAIR_INTERVAL_SECONDS", 60)

        _ensure_periodic_job(
            scheduler=scheduler,
            job_id="repair-stale-dispatch-claims",
            fn=repair_stale_dispatch_claims_job,
            interval_seconds=interval_seconds,
            queue_name=queue_names.default,
        )
        _ensure_periodic_job(
            scheduler=scheduler,
            job_id="requeue-stale-message-actions",
            fn=requeue_stale_message_actions_job,
            interval_seconds=interval_seconds,
            queue_name=queue_names.default,
        )

        scheduler.run()


if __name__ == "__main__":
    main()
