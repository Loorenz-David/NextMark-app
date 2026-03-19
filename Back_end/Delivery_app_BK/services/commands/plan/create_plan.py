from datetime import datetime, timezone
from uuid import uuid4

from sqlalchemy.exc import InvalidRequestError

from Delivery_app_BK.models import db, DeliveryPlan, RouteSolution, DeliveryPlanState, Team, Order
from Delivery_app_BK.services.domain.plan.plan_states import PlanStateId
from Delivery_app_BK.services.infra.events.emiters.order import emit_order_events
from Delivery_app_BK.sockets.emitters.route_solution_events import emit_route_solution_created
from Delivery_app_BK.sockets.notifications import notify_delivery_planning_event
from Delivery_app_BK.services.commands.order.update_order_delivery_plan import (
    apply_orders_delivery_plan_change,
)
from Delivery_app_BK.services.requests.plan.create_plan import (
    parse_create_plan_request,
)
from ...context import ServiceContext
from ..base.create_instance import create_instance
from ..utils import extract_fields
from .create_serializers import (
    serialize_created_delivery_plan,
    serialize_created_delivery_plan_type,
    serialize_created_route_solution,
)
from .plan_type_builder import build_plan_type_instances


def create_plan(ctx: ServiceContext):
    ctx.set_relationship_map(
        {
            "team_id": Team,
            "state_id": DeliveryPlanState,
            "orders": Order
        }
    )
    pending_order_events: list[dict] = []
    created_bundles: list[dict] = []
    created_route_solutions: list = []

    create_items = [
        parse_create_plan_request(field_set) for field_set in extract_fields(ctx)
    ]

    def _apply() -> None:
        creation_context: list[dict] = []

        for item in create_items:
            plan_fields = {
                "client_id": item.client_id,
                "label": item.label,
                "plan_type": item.plan_type,
                "start_date": item.start_date,
                "end_date": item.end_date,
                "state_id": PlanStateId.OPEN,
            }
            plan_instance: DeliveryPlan = create_instance(ctx, DeliveryPlan, plan_fields)
            plan_type_instance, extra_instances = build_plan_type_instances(
                ctx=ctx,
                plan_type=item.plan_type,
                plan_instance=plan_instance,
                plan_type_defaults=item.plan_type_defaults,
            )
            creation_context.append(
                {
                    "plan": plan_instance,
                    "plan_type": plan_type_instance,
                    "extra_instances": extra_instances,
                    "order_ids": item.order_ids,
                }
            )

        db.session.add_all([entry["plan"] for entry in creation_context])
        db.session.add_all([entry["plan_type"] for entry in creation_context])
        extra_instances = [instance 
                           for entry in creation_context 
                           for instance in entry["extra_instances"]
        ]
        if extra_instances:
            db.session.add_all(extra_instances)
        db.session.flush()

        for entry in creation_context:
            linked_order_ids = entry["order_ids"]
            if linked_order_ids:
                outcome = apply_orders_delivery_plan_change(
                    ctx,
                    linked_order_ids,
                    entry["plan"].id,
                )
                pending_order_events.extend(outcome["pending_events"])

        for entry in creation_context:
            plan_instance: DeliveryPlan = entry["plan"]
            plan_type_instance = entry["plan_type"]
            bundle = {
                "delivery_plan": serialize_created_delivery_plan(plan_instance),
                "delivery_plan_type": serialize_created_delivery_plan_type(
                    plan_instance.plan_type,
                    plan_type_instance,
                ),
            }
            local_route_solution = _find_created_route_solution(entry["extra_instances"])
            if local_route_solution:
                bundle["route_solution"] = serialize_created_route_solution(
                    local_route_solution
                )
                created_route_solutions.append(local_route_solution)
            created_bundles.append(bundle)

    try:
        with db.session.begin():
            _apply()
    except InvalidRequestError as exc:
        if "already begun" not in str(exc).lower():
            raise
        _apply()

    if pending_order_events:
        emit_order_events(ctx, pending_order_events)

    for route_solution in created_route_solutions:
        emit_route_solution_created(route_solution)

    for bundle in created_bundles:
        delivery_plan = bundle.get("delivery_plan") or {}
        if delivery_plan.get("plan_type") != "local_delivery":
            continue
        plan_id = delivery_plan.get("id")
        if not isinstance(plan_id, int):
            continue
        notify_delivery_planning_event(
            event_id=str(uuid4()),
            event_name="delivery_plan.created",
            team_id=ctx.team_id,
            entity_type="delivery_plan",
            entity_id=plan_id,
            payload={
                "delivery_plan_id": plan_id,
                "label": delivery_plan.get("label"),
                "plan_type": delivery_plan.get("plan_type"),
                "route_freshness_updated_at": delivery_plan.get("updated_at"),
            },
            occurred_at=datetime.now(timezone.utc),
            actor=None,
        )

    return {"created": created_bundles}


def _find_created_route_solution(extra_instances: list[object]) -> RouteSolution | None:
    for instance in extra_instances:
        if isinstance(instance, RouteSolution):
            return instance
    return None
