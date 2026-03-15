import os


class Config:
    SECRET_KEY = os.environ.get("SECRET_KEY","devkey")
    JWT_SECRET_KEY = os.environ.get("JWT_SECRET_KEY") or SECRET_KEY
    REDIS_URI = os.environ.get("REDIS_URI")
    REDIS_KEY_PREFIX = os.environ.get("REDIS_KEY_PREFIX", "nextmark")
    REDIS_DRIVER_LOCATION_TTL_SECONDS = int(os.environ.get("REDIS_DRIVER_LOCATION_TTL_SECONDS", "45"))
    REDIS_NOTIFICATION_TTL_SECONDS = int(os.environ.get("REDIS_NOTIFICATION_TTL_SECONDS", str(60 * 60 * 48)))
    REDIS_DISPATCHER_LEASE_SECONDS = int(os.environ.get("REDIS_DISPATCHER_LEASE_SECONDS", "120"))
    REDIS_DISPATCH_BATCH_SIZE = int(os.environ.get("REDIS_DISPATCH_BATCH_SIZE", "50"))
    REDIS_REPAIR_INTERVAL_SECONDS = int(os.environ.get("REDIS_REPAIR_INTERVAL_SECONDS", "60"))
    SQLALCHEMY_ENGINE_OPTIONS = {
        "connect_args": {"options": "-c timezone=UTC"}
    }
    SQLALCHEMY_TRACK_MODIFICATIONS = False
