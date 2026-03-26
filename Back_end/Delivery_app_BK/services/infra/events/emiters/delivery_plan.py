from datetime import datetime, timezone
from uuid import uuid4

from typing import Iterable

from Delivery_app_BK.models import DeliveryPlanEvent, db
from Delivery_app_BK.services.context import ServiceContext


def emit_delivery_plan_events(
    ctx: ServiceContext,
    events: Iterable[dict],
) -> list[DeliveryPlanEvent]:
    event_rows: list[DeliveryPlanEvent] = []
    actor_id = ctx.user_id if ctx.user_id else None

    for event in events:
        route_plan_id = event.get("route_plan_id") or event.get("delivery_plan_id")
        event_name = event.get("event_name")
        if not route_plan_id or not event_name:
            continue

        payload = event.get("payload")
        if not isinstance(payload, dict):
            payload = {}
        payload.setdefault("route_plan_id", route_plan_id)
        payload.setdefault("delivery_plan_id", route_plan_id)

        row = DeliveryPlanEvent(
            event_id=event.get("event_id", str(uuid4())),
            delivery_plan_id=route_plan_id,
            event_name=event_name,
            payload=payload,
            actor_id=event.get("actor_id", actor_id),
            team_id=event.get("team_id", ctx.team_id),
            entity_type="delivery_plan",
            entity_id=str(route_plan_id),
            entity_version=event.get("entity_version"),
            dispatch_status=(
                DeliveryPlanEvent.DISPATCH_STATUS_DISPATCHED
                if ctx.prevent_event_bus
                else DeliveryPlanEvent.DISPATCH_STATUS_PENDING
            ),
            dispatch_attempts=0,
            next_attempt_at=event.get("next_attempt_at") or datetime.now(timezone.utc),
        )
        db.session.add(row)
        event_rows.append(row)

    if not event_rows:
        return []

    db.session.flush()
    db.session.commit()

    return event_rows
