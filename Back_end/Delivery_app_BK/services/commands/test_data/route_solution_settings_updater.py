from __future__ import annotations

from typing import Any

from sqlalchemy.exc import InvalidRequestError

from Delivery_app_BK.models import RouteSolution, db
from Delivery_app_BK.services.context import ServiceContext

from .config import build_default_route_solution_update_settings


def update_route_solutions_settings(
    ctx: ServiceContext,
    plan_result: dict[str, Any],
) -> dict[str, Any]:
    """Update route solution settings for all local delivery plans in plan_result.

    For each local delivery plan bundle, the selected route solution is updated
    with the driver ID (current user), shift times, depot start location,
    per-stop service time, and ETA tolerance.

    All timing parameters default to the values defined in
    ``config/route_solution_update_defaults.py`` but can be overridden via
    ``incoming_data``/``route_solution_settings_data`` at the orchestrator level.
    """
    incoming_data = ctx.incoming_data if isinstance(ctx.incoming_data, dict) else {}
    settings = _parse_settings(incoming_data, ctx)

    created_bundles: list[dict[str, Any]] = plan_result.get("created", [])
    updated_ids: list[int] = []
    skipped_ids: list[int] = []

    def _apply() -> None:
        nonlocal updated_ids, skipped_ids
        updated_ids = []
        skipped_ids = []
        for bundle in created_bundles:
            if bundle.get("plan_type") != "local_delivery":
                continue
            for rs_id in bundle.get("route_solution_ids", []):
                route_solution = db.session.get(RouteSolution, rs_id)
                if route_solution is None:
                    skipped_ids.append(rs_id)
                    continue
                _apply_settings(route_solution, settings)
                updated_ids.append(rs_id)

    try:
        with db.session.begin():
            _apply()
    except InvalidRequestError as exc:
        if "already begun" not in str(exc).lower():
            raise
        _apply()

    return {
        "updated_count": len(updated_ids),
        "updated_ids": updated_ids,
        "skipped_ids": skipped_ids,
    }


def _parse_settings(
    incoming_data: dict[str, Any],
    ctx: ServiceContext,
) -> dict[str, Any]:
    """Merge incoming overrides onto the defaults; resolve driver_id from context."""
    result = build_default_route_solution_update_settings()

    if "set_start_time" in incoming_data:
        result["set_start_time"] = incoming_data["set_start_time"]
    if "set_end_time" in incoming_data:
        result["set_end_time"] = incoming_data["set_end_time"]
    if isinstance(incoming_data.get("start_location"), dict):
        result["start_location"] = incoming_data["start_location"]
    if "service_time_per_order_minutes" in incoming_data:
        result["service_time_per_order_minutes"] = int(
            incoming_data["service_time_per_order_minutes"]
        )
    if "service_time_per_item_minutes" in incoming_data:
        result["service_time_per_item_minutes"] = int(
            incoming_data["service_time_per_item_minutes"]
        )
    if "eta_tolerance_minutes" in incoming_data:
        result["eta_tolerance_minutes"] = int(incoming_data["eta_tolerance_minutes"])

    # Driver ID: explicit override beats context user_id
    raw_driver_id = incoming_data.get("driver_id")
    result["driver_id"] = int(raw_driver_id) if raw_driver_id is not None else ctx.user_id

    return result


def _apply_settings(route_solution: RouteSolution, settings: dict[str, Any]) -> None:
    route_solution.driver_id = settings.get("driver_id")
    route_solution.set_start_time = settings.get("set_start_time")
    route_solution.set_end_time = settings.get("set_end_time")
    route_solution.start_location = settings.get("start_location")
    route_solution.stops_service_time = {
        "time": int(settings.get("service_time_per_order_minutes", 3)) * 60,
        "per_item": int(settings.get("service_time_per_item_minutes", 1)) * 60,
    }
    route_solution.eta_tolerance_seconds = int(settings.get("eta_tolerance_minutes", 30)) * 60
