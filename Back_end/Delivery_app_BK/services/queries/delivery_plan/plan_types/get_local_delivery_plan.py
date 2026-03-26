from Delivery_app_BK.models import RoutePlan

from ...context import ServiceContext
from ..get_instance import get_instance
from .serialize_local_delivery_plan import serialize_local_delivery_plan


def get_route_group_plan_type(plan_id: int, ctx: ServiceContext):
    found_plan: RoutePlan = get_instance(
        ctx=ctx,
        model=RoutePlan,
        value=plan_id,
    )

    route_group = found_plan.route_group
    serialized = serialize_local_delivery_plan(route_group, ctx) if route_group else None

    return {
        "delivery_plan_type": serialized,
    }


def get_local_delivery_plan(plan_id: int, ctx: ServiceContext):
    # Backward-compatible alias while route_group naming is rolled out.
    return get_route_group_plan_type(plan_id, ctx)
