from __future__ import annotations

from flask import current_app


def get_redis_key_prefix() -> str:
    return current_app.config.get("REDIS_KEY_PREFIX", "nextmark")


def build_driver_location_key(team_id: int | str, driver_id: int | str) -> str:
    prefix = get_redis_key_prefix()
    return f"{prefix}:driver:{team_id}:{driver_id}:location"


def build_driver_location_scan_pattern(team_id: int | str) -> str:
    prefix = get_redis_key_prefix()
    return f"{prefix}:driver:{team_id}:*:location"


def build_notification_payload_key(notification_id: str) -> str:
    prefix = get_redis_key_prefix()
    return f"{prefix}:notification:{notification_id}"


def build_notification_unread_key(user_id: int | str, app_scope: str) -> str:
    prefix = get_redis_key_prefix()
    return f"{prefix}:notification:{app_scope}:{user_id}:unread"


def build_notification_count_key(user_id: int | str, app_scope: str) -> str:
    prefix = get_redis_key_prefix()
    return f"{prefix}:notification:{app_scope}:{user_id}:count"
