from __future__ import annotations

from functools import lru_cache
from urllib.parse import urlparse

from flask import current_app
from redis import Redis


def _normalize_redis_uri(redis_uri: str) -> str:
    parsed = urlparse(redis_uri)
    if parsed.scheme not in {"redis", "rediss"}:
        raise ValueError("REDIS_URI must use redis:// or rediss://.")
    return redis_uri


def get_redis_uri() -> str:
    redis_uri = current_app.config.get("REDIS_URI")
    if not redis_uri:
        raise RuntimeError("REDIS_URI is not configured.")
    return _normalize_redis_uri(redis_uri)


@lru_cache(maxsize=8)
def get_redis_connection(redis_uri: str, *, decode_responses: bool = True) -> Redis:
    return Redis.from_url(redis_uri, decode_responses=decode_responses)


def get_current_redis_connection() -> Redis:
    return get_redis_connection(get_redis_uri())


def get_rq_redis_connection(redis_uri: str) -> Redis:
    return get_redis_connection(redis_uri, decode_responses=False)


def get_current_rq_redis_connection() -> Redis:
    return get_rq_redis_connection(get_redis_uri())
