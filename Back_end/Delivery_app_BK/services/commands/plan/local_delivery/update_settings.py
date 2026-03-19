import logging
from datetime import datetime, timezone
from uuid import uuid4

from Delivery_app_BK.models import db
from Delivery_app_BK.sockets.notifications import notify_delivery_planning_event
from Delivery_app_BK.services.commands.plan.local_delivery.route_solution.update_route_solution_from_plan import (
    update_route_solution_from_plan,
)
from Delivery_app_BK.services.domain.plan.route_freshness import touch_route_freshness
from Delivery_app_BK.services.context import ServiceContext
from Delivery_app_BK.services.requests.plan.local_delivery.update_settings import (
    LocalDeliverySettingsRequest,
    RouteSolutionPatchRequest,
    parse_update_local_delivery_settings_request,
)

from ..events import emit_pending_delivery_plan_events
from .loader import load_local_delivery_settings_entities
from ..update_plan import apply_delivery_plan_patch
from .response_builder import build_local_delivery_settings_response
from .event_helpers import (
    create_local_delivery_plan_event,
    create_route_solution_event,
    create_route_solution_stop_event,
)
from Delivery_app_BK.sockets.contracts.realtime import (
    BUSINESS_EVENT_DELIVERY_PLAN_UPDATED,
    BUSINESS_EVENT_LOCAL_DELIVERY_PLAN_UPDATED,
    BUSINESS_EVENT_ROUTE_SOLUTION_UPDATED,
    BUSINESS_EVENT_ROUTE_SOLUTION_STOP_UPDATED,
)
from Delivery_app_BK.sockets.emitters.local_delivery_plan_events import (
    emit_local_delivery_plan_updated,
)
from Delivery_app_BK.sockets.emitters.route_solution_events import (
    emit_route_solution_updated,
)
from Delivery_app_BK.sockets.emitters.route_solution_stop_events import (
    emit_route_solution_stop_updated,
)
from Delivery_app_BK.services.domain.vehicle.apply_vehicle_warnings import (
    apply_vehicle_warnings_to_route_solution,
)
from Delivery_app_BK.models.tables.infrastructure.vehicle import Vehicle

logger = logging.getLogger(__name__)


def update_local_delivery_settings(ctx: ServiceContext) -> dict:
    incoming_data = ctx.incoming_data or {}
    _warn_if_driver_conflict(ctx, incoming_data)
    request: LocalDeliverySettingsRequest = parse_update_local_delivery_settings_request(
        incoming_data
    )
    return apply_local_delivery_settings_request(ctx, request)


def apply_local_delivery_settings_request(
    ctx: ServiceContext,
    request: LocalDeliverySettingsRequest,
    *,
    reset_route_execution_timing: bool = False,
) -> dict:
    local_delivery_plan, delivery_plan, route_solution = load_local_delivery_settings_entities(
        ctx=ctx,
        request=request,
    )

    # Capture old driver IDs before update
    old_route_solution_driver_id = route_solution.driver_id
    old_local_delivery_plan_driver_id = local_delivery_plan.driver_id

    previous_start, previous_end, pending_plan_events = apply_delivery_plan_patch(
        delivery_plan=delivery_plan,
        patch=request.delivery_plan,
    )

    route_updates = _build_route_solution_updates(request.route_solution)
    effective_time_zone = request.time_zone or ctx.time_zone
    route_solution, stops_changed, original_route_solution = update_route_solution_from_plan(
        route_solution=route_solution,
        updates=route_updates,
        plan_start=delivery_plan.start_date,
        plan_end=delivery_plan.end_date,
        previous_plan_start=previous_start,
        previous_plan_end=previous_end,
        create_variant_on_save=request.create_variant_on_save,
        time_zone=effective_time_zone,
    )
    if reset_route_execution_timing:
        route_solution.actual_start_time = None
        route_solution.actual_end_time = None
        route_solution.actual_end_time_source = None
        local_delivery_plan.actual_start_time = None
        local_delivery_plan.actual_end_time = None

    # Recompute vehicle warnings after all route-solution fields are settled.
    # This runs unconditionally so that a vehicle_id change, a distance refresh,
    # or a vehicle-limit change is always reflected before the commit.
    _vehicle = (
        db.session.get(Vehicle, route_solution.vehicle_id)
        if route_solution.vehicle_id
        else None
    )
    apply_vehicle_warnings_to_route_solution(
        route_solution,
        _vehicle,
        flush=False,
    )

    plan_window_changed = (
        previous_start != delivery_plan.start_date
        or previous_end != delivery_plan.end_date
    )
    route_patch_requested = _has_route_solution_patch(request.route_solution)
    route_solution_changed = (
        plan_window_changed
        or route_patch_requested
        or original_route_solution is not None
        or stops_changed
        or reset_route_execution_timing
    )
    if plan_window_changed or request.delivery_plan.has_label or route_solution_changed:
        touch_route_freshness(delivery_plan)

    db.session.add(delivery_plan)
    db.session.add(local_delivery_plan)
    db.session.add(route_solution)
    if original_route_solution is not None:
        db.session.add(original_route_solution)
    if stops_changed:
        db.session.add_all(route_solution.stops or [])
    db.session.commit()

    emit_pending_delivery_plan_events(ctx, pending_plan_events)

    # Emit real-time events after commit
    team_id = ctx.team_id

    if plan_window_changed or request.delivery_plan.has_label:
        notify_delivery_planning_event(
            event_id=str(uuid4()),
            event_name=BUSINESS_EVENT_DELIVERY_PLAN_UPDATED,
            team_id=team_id,
            entity_type="delivery_plan",
            entity_id=delivery_plan.id,
            payload={
                "delivery_plan_id": delivery_plan.id,
                "label": delivery_plan.label,
                "plan_type": delivery_plan.plan_type,
                "route_freshness_updated_at": delivery_plan.updated_at.isoformat() if delivery_plan.updated_at else None,
            },
            occurred_at=delivery_plan.updated_at or datetime.now(timezone.utc),
            actor=None,
        )
    
    # Emit event if route_solution driver changed (CRITICAL: driver assignment)
    if route_solution.driver_id != old_route_solution_driver_id:
        create_route_solution_event(
            ctx=ctx,
            team_id=team_id,
            route_solution_id=route_solution.id,
            event_name=BUSINESS_EVENT_ROUTE_SOLUTION_UPDATED,
            payload={
                "driver_id": route_solution.driver_id,
                "old_driver_id": old_route_solution_driver_id,
            },
        )
        emit_route_solution_updated(route_solution, payload={"driver_id": route_solution.driver_id})
    
    # Emit event if local_delivery_plan driver changed
    if local_delivery_plan.driver_id != old_local_delivery_plan_driver_id:
        create_local_delivery_plan_event(
            ctx=ctx,
            team_id=team_id,
            local_delivery_plan_id=local_delivery_plan.id,
            event_name=BUSINESS_EVENT_LOCAL_DELIVERY_PLAN_UPDATED,
            payload={
                "driver_id": local_delivery_plan.driver_id,
                "old_driver_id": old_local_delivery_plan_driver_id,
            },
        )
        emit_local_delivery_plan_updated(local_delivery_plan, payload={"driver_id": local_delivery_plan.driver_id})
    
    # Emit event if route_solution was modified (other than driver assignment)
    if route_solution_changed and route_solution.driver_id == old_route_solution_driver_id:
        create_route_solution_event(
            ctx=ctx,
            team_id=team_id,
            route_solution_id=route_solution.id,
            event_name=BUSINESS_EVENT_ROUTE_SOLUTION_UPDATED,
            payload={
                "is_selected": route_solution.is_selected,
                "label": route_solution.label,
            },
        )
        emit_route_solution_updated(route_solution)
    
    # Emit events for each affected stop
    if stops_changed and route_solution.stops:
        for stop in route_solution.stops:
            create_route_solution_stop_event(
                ctx=ctx,
                team_id=team_id,
                route_solution_stop_id=stop.id,
                event_name=BUSINESS_EVENT_ROUTE_SOLUTION_STOP_UPDATED,
                payload={
                    "stop_order": stop.stop_order,
                    "expected_arrival_time": stop.expected_arrival_time.isoformat() if stop.expected_arrival_time else None,
                    "expected_departure_time": stop.expected_departure_time.isoformat() if stop.expected_departure_time else None,
                },
            )
            emit_route_solution_stop_updated(stop)

    return build_local_delivery_settings_response(
        ctx=ctx,
        route_solution=route_solution,
        stops_changed=stops_changed,
        route_solution_changed=route_solution_changed,
    )


def _build_route_solution_updates(route_patch: RouteSolutionPatchRequest) -> dict:
    updates: dict = {"route_solution_id": route_patch.route_solution_id}

    if route_patch.has_start_location:
        updates["start_location"] = route_patch.start_location
    if route_patch.has_end_location:
        updates["end_location"] = route_patch.end_location
    if route_patch.has_set_start_time:
        updates["set_start_time"] = route_patch.set_start_time
    if route_patch.has_set_end_time:
        updates["set_end_time"] = route_patch.set_end_time
    if route_patch.has_eta_tolerance_seconds:
        updates["eta_tolerance_seconds"] = route_patch.eta_tolerance_seconds
    if route_patch.has_route_end_strategy:
        updates["route_end_strategy"] = route_patch.route_end_strategy
    if route_patch.has_driver_id:
        updates["driver_id"] = route_patch.driver_id
    if route_patch.has_vehicle_id:
        updates["vehicle_id"] = route_patch.vehicle_id
    if route_patch.has_stops_service_time:
        updates["stops_service_time"] = route_patch.stops_service_time

    return updates


def _warn_if_driver_conflict(ctx: ServiceContext, raw: dict) -> None:
    if not isinstance(raw, dict):
        return
    local_payload = raw.get("local_delivery_plan") if isinstance(raw.get("local_delivery_plan"), dict) else {}
    route_payload = raw.get("route_solution") if isinstance(raw.get("route_solution"), dict) else {}
    if "driver_id" not in local_payload or "driver_id" not in route_payload:
        return
    if local_payload.get("driver_id") != route_payload.get("driver_id"):
        ctx.set_warning(
            "route_solution.driver_id overrides local_delivery_plan.driver_id in this update."
        )


def _has_route_solution_patch(route_patch: RouteSolutionPatchRequest) -> bool:
    return any(
        [
            route_patch.has_start_location,
            route_patch.has_end_location,
            route_patch.has_set_start_time,
            route_patch.has_set_end_time,
            route_patch.has_eta_tolerance_seconds,
            route_patch.has_route_end_strategy,
            route_patch.has_driver_id,
            route_patch.has_vehicle_id,
            route_patch.has_stops_service_time,
        ]
    )
