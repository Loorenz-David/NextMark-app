from __future__ import annotations

DEFAULT_ROUTE_SOLUTION_SET_START_TIME: str = "09:00"
DEFAULT_ROUTE_SOLUTION_SET_END_TIME: str = "16:00"

DEFAULT_ROUTE_SOLUTION_START_LOCATION: dict = {
    "city": "Stockholms län",
    "coordinates": {"lat": 59.41324450245052, "lng": 17.92244581469024},
    "country": "Sweden",
    "postal_code": "164 73",
    "street_address": "Sibeliusgången 2A, 164 73 Kista, Sweden",
}

DEFAULT_SERVICE_TIME_PER_ORDER_MINUTES: int = 3
DEFAULT_SERVICE_TIME_PER_ITEM_MINUTES: int = 1
DEFAULT_ETA_TOLERANCE_MINUTES: int = 30


def build_default_route_solution_update_settings() -> dict:
    """Return a fresh copy of default route solution update settings."""
    return {
        "set_start_time": DEFAULT_ROUTE_SOLUTION_SET_START_TIME,
        "set_end_time": DEFAULT_ROUTE_SOLUTION_SET_END_TIME,
        "start_location": dict(DEFAULT_ROUTE_SOLUTION_START_LOCATION),
        "service_time_per_order_minutes": DEFAULT_SERVICE_TIME_PER_ORDER_MINUTES,
        "service_time_per_item_minutes": DEFAULT_SERVICE_TIME_PER_ITEM_MINUTES,
        "eta_tolerance_minutes": DEFAULT_ETA_TOLERANCE_MINUTES,
    }


__all__ = [
    "DEFAULT_ROUTE_SOLUTION_SET_START_TIME",
    "DEFAULT_ROUTE_SOLUTION_SET_END_TIME",
    "DEFAULT_ROUTE_SOLUTION_START_LOCATION",
    "DEFAULT_SERVICE_TIME_PER_ORDER_MINUTES",
    "DEFAULT_SERVICE_TIME_PER_ITEM_MINUTES",
    "DEFAULT_ETA_TOLERANCE_MINUTES",
    "build_default_route_solution_update_settings",
]
