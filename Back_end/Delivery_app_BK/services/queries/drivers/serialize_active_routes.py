from typing import List

from Delivery_app_BK.models import DeliveryPlan, RouteSolution
from Delivery_app_BK.services.context import ServiceContext
from Delivery_app_BK.services.queries.plan_types.serialize_local_delivery_plan import (
    serialize_local_delivery_plan,
)
from Delivery_app_BK.services.queries.route_solutions import (
    serialize_route_solution,
)
from Delivery_app_BK.services.queries.utils import map_return_values


def _serialize_delivery_plan_collapsed(instance: DeliveryPlan | None):
    if instance is None:
        return None

    start_date = instance.start_date
    end_date = instance.end_date
    created_at = instance.created_at
    return {
        "id": instance.id,
        "client_id": instance.client_id,
        "label": instance.label,
        "plan_type": instance.plan_type,
        "start_date": start_date.isoformat() if start_date else None,
        "end_date": end_date.isoformat() if end_date else None,
        "created_at": created_at.isoformat() if created_at else None,
        "state_id": instance.state_id,
    }


def _serialize_active_route(instance: RouteSolution, ctx: ServiceContext):
    local_delivery_plan = getattr(instance, "local_delivery_plan", None)
    delivery_plan = getattr(local_delivery_plan, "delivery_plan", None) if local_delivery_plan else None

    unpacked = {
        **serialize_route_solution(instance),
        "delivery_plan": _serialize_delivery_plan_collapsed(delivery_plan),
        "local_delivery_plan": (
            serialize_local_delivery_plan(local_delivery_plan, ctx)
            if local_delivery_plan is not None
            else None
        ),
    }

    return unpacked


def serialize_active_routes(instances: List[RouteSolution], ctx: ServiceContext):
    unpacked_instances = [
        _serialize_active_route(instance, ctx)
        for instance in instances
    ]

    return map_return_values(unpacked_instances, ctx, "route")
