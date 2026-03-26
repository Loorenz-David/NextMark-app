from Delivery_app_BK.models import RoutePlan
from Delivery_app_BK.errors import NotFound

from ...context import ServiceContext
from ..get_instance import get_instance 
from .serialize_plan import serialize_plans


def get_plan(plan_id: int, ctx: ServiceContext):

    found_plan = get_instance(
        ctx = ctx,
        model = RoutePlan,
        value = plan_id
    )

    if not found_plan:
        raise NotFound(f"Route plan with id: {plan_id} does not exist.")

    serialized = serialize_plans(
        instances=[found_plan],
        ctx=ctx,
    )

    return {
        "route_plan": serialized[0] if isinstance(serialized, list) else serialized
    }
