from datetime import datetime, timezone
from uuid import uuid4

from Delivery_app_BK.models import db, DeliveryPlan
from Delivery_app_BK.sockets.notifications import notify_delivery_planning_event
from ...context import ServiceContext
from ..base.delete_instance import delete_instance
from ..utils import extract_ids


def delete_plan(ctx: ServiceContext):
    instances = []
    deleted_plans: list[dict] = []
    for target_id in extract_ids(ctx):
        plan = db.session.get(DeliveryPlan, target_id)
        if plan is not None and plan.plan_type == "local_delivery":
            deleted_plans.append({
                "id": plan.id,
                "label": plan.label,
                "plan_type": plan.plan_type,
                "team_id": plan.team_id,
            })
        instances.append(delete_instance(ctx, DeliveryPlan, target_id))
    db.session.commit()

    for plan in deleted_plans:
        notify_delivery_planning_event(
            event_id=str(uuid4()),
            event_name="delivery_plan.deleted",
            team_id=plan["team_id"],
            entity_type="delivery_plan",
            entity_id=plan["id"],
            payload={
                "delivery_plan_id": plan["id"],
                "label": plan["label"],
                "plan_type": plan["plan_type"],
            },
            occurred_at=datetime.now(timezone.utc),
            actor=None,
        )
    return instances
