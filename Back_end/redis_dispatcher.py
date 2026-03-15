import os
import time
from uuid import uuid4

from Delivery_app_BK import create_app
from Delivery_app_BK.services.infra.events.dispatcher import dispatch_pending_events


def main() -> None:
    config_name = os.environ.get("APP_ENV", "development")
    app = create_app(config_name)
    dispatcher_id = os.environ.get("DISPATCHER_ID", f"dispatcher-{uuid4()}")

    with app.app_context():
        while True:
            claimed = dispatch_pending_events(
                dispatcher_id=dispatcher_id,
                batch_size=app.config.get("REDIS_DISPATCH_BATCH_SIZE", 50),
                lease_seconds=app.config.get("REDIS_DISPATCHER_LEASE_SECONDS", 120),
            )
            time.sleep(1 if claimed else 3)


if __name__ == "__main__":
    main()
