import os

from Delivery_app_BK import create_app
from Delivery_app_BK.services.infra.jobs.queues import get_named_queue
from Delivery_app_BK.services.infra.jobs.runtime import get_worker_class
from Delivery_app_BK.services.infra.redis import get_current_rq_redis_connection


def main() -> None:
    config_name = os.environ.get("APP_ENV", "development")
    app = create_app(config_name)

    with app.app_context():
        connection = get_current_rq_redis_connection()
        worker_class = get_worker_class()
        worker = worker_class(
            [
                get_named_queue("events", connection=connection),
                get_named_queue("default", connection=connection),
                get_named_queue("realtime", connection=connection),
            ],
            connection=connection,
            name=os.environ.get("RQ_WORKER_NAME", "worker-default"),
        )
        worker.work()


if __name__ == "__main__":
    main()
