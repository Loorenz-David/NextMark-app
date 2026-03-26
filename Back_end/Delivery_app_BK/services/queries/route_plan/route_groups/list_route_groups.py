from sqlalchemy.orm.exc import NoResultFound

from Delivery_app_BK.models import RoutePlan
from Delivery_app_BK.errors import NotFound
from Delivery_app_BK.services.context import ServiceContext
from Delivery_app_BK.services.queries.get_instance import get_instance
from Delivery_app_BK.services.queries.route_plan.plan_types.serialize_local_delivery_plan import (
    serialize_local_delivery_plans,
)


def list_route_groups(route_plan_id: int, ctx: ServiceContext) -> dict:
    """
    Returns the route groups attached to a route plan.

    Currently at most one RouteGroup exists per RoutePlan (one-to-one relationship).
    The response shape uses a list to allow future expansion without a contract break.
    """
    try:
        route_plan: RoutePlan = get_instance(ctx=ctx, model=RoutePlan, value=route_plan_id)
    except NoResultFound:
        raise NotFound(f"Route plan {route_plan_id} not found.")

    route_group = route_plan.route_group
    route_groups = [route_group] if route_group is not None else []
    serialized = serialize_local_delivery_plans(route_groups, ctx) if route_groups else []

    return {
        "route_plan_id": route_plan_id,
        "route_groups": serialized,
    }
