from Delivery_app_BK.models import LocalDeliveryPlan, db
from Delivery_app_BK.services.domain.plan.route_freshness import get_route_freshness_updated_at
from Delivery_app_BK.sockets.contracts.realtime import (
    BUSINESS_EVENT_LOCAL_DELIVERY_PLAN_UPDATED,
)
from Delivery_app_BK.sockets.emitters.common import build_business_event_envelope, emit_business_event
from Delivery_app_BK.sockets.notifications import notify_delivery_planning_event
from Delivery_app_BK.sockets.rooms.names import build_team_admin_room, build_team_members_room


def emit_local_delivery_plan_updated(local_delivery_plan: LocalDeliveryPlan, *, payload: dict | None = None) -> None:
    """Emit LocalDeliveryPlan updated event. Broadcast to team_orders (admin visibility) and team_members (driver notification)."""
    if not local_delivery_plan or not local_delivery_plan.delivery_plan_id:
        return

    delivery_plan = db.session.get(LocalDeliveryPlan, local_delivery_plan.id)
    if not delivery_plan or not delivery_plan.delivery_plan:
        return
    root_delivery_plan = delivery_plan.delivery_plan

    team_id = local_delivery_plan.team_id

    envelope = build_business_event_envelope(
        event_name=BUSINESS_EVENT_LOCAL_DELIVERY_PLAN_UPDATED,
        occurred_at=None,
        team_id=team_id,
        entity_type="local_delivery_plan",
        entity_id=local_delivery_plan.id,
        payload={
            "local_delivery_plan_id": local_delivery_plan.id,
            "delivery_plan_id": local_delivery_plan.delivery_plan_id,
            "label": root_delivery_plan.label,
            "plan_type": root_delivery_plan.plan_type,
            "route_freshness_updated_at": get_route_freshness_updated_at(root_delivery_plan),
            "driver_id": local_delivery_plan.driver_id,
            "actual_start_time": local_delivery_plan.actual_start_time.isoformat() if local_delivery_plan.actual_start_time else None,
            "actual_end_time": local_delivery_plan.actual_end_time.isoformat() if local_delivery_plan.actual_end_time else None,
            **(payload or {}),
        },
    )

    # Broadcast to team_admin room (admin visibility)
    emit_business_event(room=build_team_admin_room(team_id), envelope=envelope)
    # Broadcast to team_members room (driver notification)
    emit_business_event(room=build_team_members_room(team_id), envelope=envelope)
    notify_delivery_planning_event(
        event_id=envelope["event_id"],
        event_name=BUSINESS_EVENT_LOCAL_DELIVERY_PLAN_UPDATED,
        team_id=team_id,
        entity_type="local_delivery_plan",
        entity_id=local_delivery_plan.id,
        payload=envelope["payload"],
        occurred_at=envelope["occurred_at"],
        actor=None,
    )
