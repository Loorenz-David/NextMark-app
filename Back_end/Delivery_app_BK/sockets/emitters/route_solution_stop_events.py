from flask import current_app

from Delivery_app_BK.models import RouteSolutionStop, RouteSolution, LocalDeliveryPlan, db
from Delivery_app_BK.sockets.contracts.realtime import (
    BUSINESS_EVENT_ROUTE_SOLUTION_STOP_UPDATED,
)
from Delivery_app_BK.sockets.emitters.common import build_business_event_envelope, emit_business_event
from Delivery_app_BK.sockets.rooms.names import build_team_admin_room, build_team_members_room


def emit_route_solution_stop_updated(route_solution_stop: RouteSolutionStop, *, payload: dict | None = None) -> None:
    """Emit RouteSolutionStop updated event. Broadcast to team_orders (admin visibility) and team_members (driver notification)."""
    if not route_solution_stop or not route_solution_stop.route_solution_id:
        current_app.logger.warning("Cannot emit route_solution_stop.updated: missing route_solution_stop or route_solution_id")
        return

    route_solution = db.session.get(RouteSolution, route_solution_stop.route_solution_id)
    if not route_solution or not route_solution.local_delivery_plan_id:
        current_app.logger.warning(
            "Cannot emit route_solution_stop.updated: missing route_solution (solution_id=%s)",
            route_solution_stop.route_solution_id
        )
        return

    local_delivery_plan = db.session.get(LocalDeliveryPlan, route_solution.local_delivery_plan_id)
    if not local_delivery_plan or not local_delivery_plan.delivery_plan_id:
        current_app.logger.warning(
            "Cannot emit route_solution_stop.updated: missing local_delivery_plan (plan_id=%s)",
            route_solution.local_delivery_plan_id
        )
        return

    team_id = route_solution_stop.team_id

    envelope = build_business_event_envelope(
        event_name=BUSINESS_EVENT_ROUTE_SOLUTION_STOP_UPDATED,
        occurred_at=None,
        team_id=team_id,
        entity_type="route_solution_stop",
        entity_id=route_solution_stop.id,
        payload={
            "route_solution_stop_id": route_solution_stop.id,
            "route_solution_id": route_solution_stop.route_solution_id,
            "order_id": route_solution_stop.order_id,
            "stop_order": route_solution_stop.stop_order,
            "expected_arrival_time": route_solution_stop.expected_arrival_time.isoformat() if route_solution_stop.expected_arrival_time else None,
            "expected_departure_time": route_solution_stop.expected_departure_time.isoformat() if route_solution_stop.expected_departure_time else None,
            "actual_arrival_time": route_solution_stop.actual_arrival_time.isoformat() if route_solution_stop.actual_arrival_time else None,
            "actual_departure_time": route_solution_stop.actual_departure_time.isoformat() if route_solution_stop.actual_departure_time else None,
            **(payload or {}),
        },
    )

    # Broadcast to team_admin room (admin visibility)
    emit_business_event(room=build_team_admin_room(team_id), envelope=envelope)
    # Broadcast to team_members room (driver notification)
    emit_business_event(room=build_team_members_room(team_id), envelope=envelope)
    # Also broadcast to order room for order-specific listeners
    emit_business_event(room=f"order:{route_solution_stop.order_id}", envelope=envelope)
    
    current_app.logger.info(
        "Emitted route_solution_stop.updated: stop_id=%d, route_id=%d, order_id=%d, team_id=%d",
        route_solution_stop.id, route_solution_stop.route_solution_id, route_solution_stop.order_id, team_id
    )
