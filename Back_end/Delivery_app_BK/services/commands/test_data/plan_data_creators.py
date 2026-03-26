from __future__ import annotations

from datetime import datetime, timedelta, timezone
from typing import Any

from sqlalchemy.exc import InvalidRequestError

from Delivery_app_BK.errors import ValidationFailed
from Delivery_app_BK.models import (
    DeliveryPlan,
    DeliveryPlanEvent,
    DeliveryPlanEventAction,
    InternationalShippingPlan,
    LocalDeliveryPlan,
    RouteSolution,
    StorePickupPlan,
    db,
)
from Delivery_app_BK.route_optimization.constants.is_optimized import (
    IS_OPTIMIZED_NOT_OPTIMIZED,
)
from Delivery_app_BK.route_optimization.constants.route_end_strategy import ROUND_TRIP
from Delivery_app_BK.services.domain.delivery_plan.plan.plan_states import PlanStateId
from Delivery_app_BK.services.commands.base.create_instance import create_instance
from Delivery_app_BK.services.commands.utils import generate_client_id
from Delivery_app_BK.services.context import ServiceContext
from .config import (
    DEFAULT_CARRIER_NAME,
    DEFAULT_EVENT_ACTION_NAME,
    DEFAULT_EVENT_ACTION_STATUS,
    DEFAULT_EVENT_NAME,
    DEFAULT_PLAN_TYPE,
    build_default_plan_payloads,
    build_default_plan_label,
)


def generate_plan_test_data(ctx: ServiceContext) -> dict[str, Any]:
    """Generate one or more configurable plan bundles for test scenarios."""
    incoming_data = ctx.incoming_data if isinstance(ctx.incoming_data, dict) else {}
    raw_plans = incoming_data.get("plans")

    if raw_plans is None:
        plan_payloads = build_default_plan_payloads()
    else:
        if not isinstance(raw_plans, list):
            raise ValidationFailed("plans must be a list of objects.")
        plan_payloads = raw_plans

    for index, payload in enumerate(plan_payloads):
        if not isinstance(payload, dict):
            raise ValidationFailed(
                f"Each plan payload must be an object. Invalid payload at index {index}."
            )

    created: list[dict[str, Any]] = []

    def _apply() -> None:
        for index, payload in enumerate(plan_payloads, start=1):
            created.append(create_plan_bundle(ctx, payload, sequence=index))

    try:
        with db.session.begin():
            _apply()
    except InvalidRequestError as exc:
        if "already begun" not in str(exc).lower():
            raise
        _apply()

    return {
        "count": len(created),
        "created": created,
    }


def create_plan_bundle(
    ctx: ServiceContext,
    payload: dict[str, Any],
    sequence: int = 1,
) -> dict[str, Any]:
    """Create a delivery plan and related type/event rows from a nested config object."""
    if not isinstance(payload, dict):
        raise ValidationFailed("Plan bundle payload must be an object.")

    plan = create_delivery_plan_row(
        ctx,
        _as_dict(payload.get("delivery_plan")),
        sequence=sequence,
    )

    plan_type_instance: Any | None = None
    route_solution_ids: list[int] = []

    if plan.plan_type == "local_delivery":
        local_delivery_payload = _as_dict(payload.get("local_delivery_plan"))
        local_delivery = create_local_delivery_plan_row(ctx, plan, local_delivery_payload)
        plan_type_instance = local_delivery

        raw_route_solutions = payload.get("route_solutions")
        route_solution_payloads = _as_list_of_dicts(
            raw_route_solutions,
            field_name="route_solutions",
            default=[{}],
        )
        for route_index, route_payload in enumerate(route_solution_payloads, start=1):
            route_solution = create_route_solution_row(
                ctx,
                local_delivery,
                route_payload,
                route_index=route_index,
            )
            db.session.flush()
            route_solution_ids.append(route_solution.id)

    elif plan.plan_type == "international_shipping":
        shipping_payload = _as_dict(payload.get("international_shipping_plan"))
        plan_type_instance = create_international_shipping_plan_row(
            ctx,
            plan,
            shipping_payload,
        )

    elif plan.plan_type == "store_pickup":
        pickup_payload = _as_dict(payload.get("store_pickup_plan"))
        plan_type_instance = create_store_pickup_plan_row(ctx, plan, pickup_payload)

    raw_events = payload.get("events")
    event_payloads = _as_list_of_dicts(raw_events, field_name="events", default=[])

    event_ids: list[int] = []
    event_action_ids: list[int] = []
    for event_payload in event_payloads:
        action_payloads = _as_list_of_dicts(
            event_payload.get("actions"),
            field_name="events.actions",
            default=[],
        )
        event = create_delivery_plan_event_row(ctx, plan, event_payload)
        db.session.flush()
        event_ids.append(event.id)

        for action_payload in action_payloads:
            action = create_delivery_plan_event_action_row(ctx, event, action_payload)
            db.session.flush()
            event_action_ids.append(action.id)

    db.session.flush()
    return {
        "delivery_plan_id": plan.id,
        "delivery_plan_client_id": plan.client_id,
        "plan_type": plan.plan_type,
        "plan_type_id": getattr(plan_type_instance, "id", None),
        "route_solution_ids": route_solution_ids,
        "event_ids": event_ids,
        "event_action_ids": event_action_ids,
    }


def create_delivery_plan_row(
    ctx: ServiceContext,
    payload: dict[str, Any] | None = None,
    *,
    sequence: int = 1,
) -> DeliveryPlan:
    payload = payload or {}
    plan_type = _normalize_plan_type(payload.get("plan_type"))

    start_date = _parse_datetime(payload.get("start_date")) or datetime.now(timezone.utc)
    end_date = _parse_datetime(payload.get("end_date")) or (start_date + timedelta(hours=8))
    if end_date < start_date:
        raise ValidationFailed("delivery_plan.end_date cannot be before start_date.")

    fields: dict[str, Any] = {
        "client_id": _resolve_client_id(payload.get("client_id"), "delivery_plan"),
        "label": _resolve_label(payload.get("label"), sequence),
        "plan_type": plan_type,
        "start_date": start_date,
        "end_date": end_date,
        "state_id": _as_positive_int(payload.get("state_id"), default=PlanStateId.OPEN),
        "total_weight_g": payload.get("total_weight_g"),
        "total_volume_cm3": payload.get("total_volume_cm3"),
        "total_item_count": payload.get("total_item_count"),
        "total_orders": payload.get("total_orders"),
    }

    plan = create_instance(ctx, DeliveryPlan, _compact_none(fields))
    db.session.add(plan)
    return plan


def create_local_delivery_plan_row(
    ctx: ServiceContext,
    delivery_plan: DeliveryPlan,
    payload: dict[str, Any] | None = None,
) -> LocalDeliveryPlan:
    payload = payload or {}

    fields = {
        "client_id": _resolve_client_id(payload.get("client_id"), "local_delivery"),
        "actual_start_time": _parse_datetime(payload.get("actual_start_time")),
        "actual_end_time": _parse_datetime(payload.get("actual_end_time")),
        "driver_id": _as_optional_positive_int(payload.get("driver_id")),
    }
    instance = create_instance(ctx, LocalDeliveryPlan, _compact_none(fields))
    instance.delivery_plan = delivery_plan
    db.session.add(instance)
    return instance


def create_route_solution_row(
    ctx: ServiceContext,
    local_delivery_plan: LocalDeliveryPlan,
    payload: dict[str, Any] | None = None,
    *,
    route_index: int = 1,
) -> RouteSolution:
    payload = payload or {}

    fields = {
        "client_id": _resolve_client_id(payload.get("client_id"), "route_solution"),
        "label": payload.get("label") or f"variant {route_index}",
        "version": _as_positive_int(payload.get("version"), default=1),
        "algorithm": payload.get("algorithm"),
        "score": payload.get("score"),
        "total_distance_meters": payload.get("total_distance_meters"),
        "total_travel_time_seconds": payload.get("total_travel_time_seconds"),
        "expected_start_time": _parse_datetime(payload.get("expected_start_time")),
        "expected_end_time": _parse_datetime(payload.get("expected_end_time")),
        "actual_start_time": _parse_datetime(payload.get("actual_start_time")),
        "actual_end_time": _parse_datetime(payload.get("actual_end_time")),
        "has_route_warnings": bool(payload.get("has_route_warnings", False)),
        "route_warnings": payload.get("route_warnings"),
        "start_location": _as_optional_dict(payload.get("start_location")),
        "end_location": _as_optional_dict(payload.get("end_location")),
        "route_end_strategy": payload.get("route_end_strategy") or ROUND_TRIP,
        "set_start_time": payload.get("set_start_time"),
        "set_end_time": payload.get("set_end_time"),
        "eta_tolerance_seconds": _as_non_negative_int(
            payload.get("eta_tolerance_seconds"),
            default=0,
            max_value=7200,
        ),
        "stops_service_time": _as_optional_dict(payload.get("stops_service_time")),
        "is_selected": bool(payload.get("is_selected", route_index == 1)),
        "is_optimized": payload.get("is_optimized") or IS_OPTIMIZED_NOT_OPTIMIZED,
        "stop_count": _as_non_negative_int(payload.get("stop_count"), default=0),
        "driver_id": _as_optional_positive_int(payload.get("driver_id")),
        "vehicle_id": _as_optional_positive_int(payload.get("vehicle_id")),
        "start_leg_polyline": _as_optional_dict(payload.get("start_leg_polyline")),
        "end_leg_polyline": _as_optional_dict(payload.get("end_leg_polyline")),
    }

    instance = create_instance(ctx, RouteSolution, _compact_none(fields))
    instance.local_delivery_plan = local_delivery_plan
    db.session.add(instance)
    return instance


def create_international_shipping_plan_row(
    ctx: ServiceContext,
    delivery_plan: DeliveryPlan,
    payload: dict[str, Any] | None = None,
) -> InternationalShippingPlan:
    payload = payload or {}

    fields = {
        "client_id": _resolve_client_id(
            payload.get("client_id"),
            "international_shipping",
        ),
        "carrier_name": payload.get("carrier_name") or DEFAULT_CARRIER_NAME,
    }
    instance = create_instance(ctx, InternationalShippingPlan, _compact_none(fields))
    instance.delivery_plan = delivery_plan
    db.session.add(instance)
    return instance


def create_store_pickup_plan_row(
    ctx: ServiceContext,
    delivery_plan: DeliveryPlan,
    payload: dict[str, Any] | None = None,
) -> StorePickupPlan:
    payload = payload or {}

    fields = {
        "client_id": _resolve_client_id(payload.get("client_id"), "store_pickup"),
        "pickup_location": _as_optional_dict(payload.get("pickup_location")),
        "assigned_user_id": _as_optional_positive_int(payload.get("assigned_user_id")),
    }
    instance = create_instance(ctx, StorePickupPlan, _compact_none(fields))
    instance.delivery_plan = delivery_plan
    db.session.add(instance)
    return instance


def create_delivery_plan_event_row(
    ctx: ServiceContext,
    delivery_plan: DeliveryPlan,
    payload: dict[str, Any] | None = None,
) -> DeliveryPlanEvent:
    payload = payload or {}
    raw_payload = payload.get("payload")
    event_payload = raw_payload if isinstance(raw_payload, dict) else {}

    fields = {
        "event_name": payload.get("event_name") or DEFAULT_EVENT_NAME,
        "payload": event_payload,
        "occurred_at": _parse_datetime(payload.get("occurred_at"))
        or datetime.now(timezone.utc),
        "actor_id": _as_optional_positive_int(payload.get("actor_id")),
    }
    instance = create_instance(ctx, DeliveryPlanEvent, _compact_none(fields))
    instance.delivery_plan = delivery_plan
    db.session.add(instance)
    return instance


def create_delivery_plan_event_action_row(
    ctx: ServiceContext,
    event: DeliveryPlanEvent,
    payload: dict[str, Any] | None = None,
) -> DeliveryPlanEventAction:
    payload = payload or {}

    fields = {
        "action_name": payload.get("action_name") or DEFAULT_EVENT_ACTION_NAME,
        "status": payload.get("status") or DEFAULT_EVENT_ACTION_STATUS,
        "attempts": _as_non_negative_int(payload.get("attempts"), default=0),
        "last_error": payload.get("last_error"),
        "scheduled_for": _parse_datetime(payload.get("scheduled_for")),
        "enqueued_at": _parse_datetime(payload.get("enqueued_at")),
        "processed_at": _parse_datetime(payload.get("processed_at")),
        "schedule_anchor_type": payload.get("schedule_anchor_type"),
        "schedule_anchor_at": _parse_datetime(payload.get("schedule_anchor_at")),
    }
    instance = create_instance(ctx, DeliveryPlanEventAction, _compact_none(fields))
    instance.event = event
    db.session.add(instance)
    return instance


def _as_dict(value: Any) -> dict[str, Any]:
    if value is None:
        return {}
    if not isinstance(value, dict):
        raise ValidationFailed("Expected an object payload.")
    return value


def _as_list_of_dicts(
    value: Any,
    *,
    field_name: str,
    default: list[dict[str, Any]],
) -> list[dict[str, Any]]:
    if value is None:
        return default
    if not isinstance(value, list):
        raise ValidationFailed(f"{field_name} must be a list of objects.")
    output: list[dict[str, Any]] = []
    for index, item in enumerate(value):
        if not isinstance(item, dict):
            raise ValidationFailed(
                f"{field_name}[{index}] must be an object.")
        output.append(item)
    return output


def _parse_datetime(value: Any) -> datetime | None:
    if value is None:
        return None
    if isinstance(value, datetime):
        if value.tzinfo is None:
            return value.replace(tzinfo=timezone.utc)
        return value
    if isinstance(value, str):
        raw = value.strip()
        if not raw:
            return None
        normalized = raw.replace("Z", "+00:00")
        try:
            parsed = datetime.fromisoformat(normalized)
        except ValueError as exc:
            raise ValidationFailed(f"Invalid datetime value: '{value}'.") from exc
        if parsed.tzinfo is None:
            return parsed.replace(tzinfo=timezone.utc)
        return parsed
    raise ValidationFailed("Datetime values must be ISO strings or datetime objects.")


def _normalize_plan_type(value: Any) -> str:
    if isinstance(value, str):
        normalized = value.strip()
        if normalized:
            if normalized in DeliveryPlan.PLAN_TYPES:
                return normalized
            raise ValidationFailed(
                f"Invalid delivery_plan.plan_type '{normalized}'. "
                f"Allowed values: {sorted(DeliveryPlan.PLAN_TYPES)}"
            )
    return DEFAULT_PLAN_TYPE


def _resolve_label(label: Any, sequence: int) -> str:
    if isinstance(label, str):
        normalized = label.strip()
        if normalized:
            return normalized
    return build_default_plan_label(sequence)


def _resolve_client_id(value: Any, prefix: str) -> str:
    if isinstance(value, str):
        normalized = value.strip()
        if normalized:
            return normalized
    return generate_client_id(prefix)


def _as_positive_int(value: Any, *, default: int) -> int:
    if value is None:
        return default
    if isinstance(value, bool) or not isinstance(value, int) or value <= 0:
        raise ValidationFailed("Expected a positive integer value.")
    return value


def _as_optional_positive_int(value: Any) -> int | None:
    if value is None:
        return None
    return _as_positive_int(value, default=1)


def _as_non_negative_int(value: Any, *, default: int, max_value: int | None = None) -> int:
    if value is None:
        result = default
    else:
        if isinstance(value, bool) or not isinstance(value, int) or value < 0:
            raise ValidationFailed("Expected a non-negative integer value.")
        result = value

    if max_value is not None and result > max_value:
        return max_value
    return result


def _as_optional_dict(value: Any) -> dict[str, Any] | None:
    if value is None:
        return None
    if not isinstance(value, dict):
        raise ValidationFailed("Expected an object value.")
    return value


def _compact_none(fields: dict[str, Any]) -> dict[str, Any]:
    return {key: value for key, value in fields.items() if value is not None}


__all__ = [
    "create_delivery_plan_row",
    "create_local_delivery_plan_row",
    "create_route_solution_row",
    "create_international_shipping_plan_row",
    "create_store_pickup_plan_row",
    "create_delivery_plan_event_row",
    "create_delivery_plan_event_action_row",
    "create_plan_bundle",
    "generate_plan_test_data",
]