from sqlalchemy.orm.exc import NoResultFound

from Delivery_app_BK.models import RoutePlan
from Delivery_app_BK.errors import NotFound
from Delivery_app_BK.services.context import ServiceContext
from Delivery_app_BK.services.queries.get_instance import get_instance


def _serialize_selected_route_solution(route_group):
    route_solutions = list(getattr(route_group, "route_solutions", None) or [])
    if not route_solutions:
        return None

    selected = next(
        (solution for solution in route_solutions if getattr(solution, "is_selected", False)),
        route_solutions[0],
    )
    return {
        "id": selected.id,
        "version": selected.version,
        "is_selected": selected.is_selected,
        "is_optimized": selected.is_optimized,
        "total_distance_meters": selected.total_distance_meters,
        "total_travel_time_seconds": selected.total_travel_time_seconds,
        "stop_count": selected.stop_count,
        "order_count": selected.order_count,
    }


def _serialize_route_group(route_group) -> dict:
    zone = getattr(route_group, "zone", None)
    driver = getattr(route_group, "driver", None)
    state = getattr(route_group, "state", None)
    return {
        "id": route_group.id,
        "client_id": route_group.client_id,
        "name": getattr(route_group, "name", None),
        "zone_id": getattr(route_group, "zone_id", None),
        "zone_geometry_snapshot": getattr(route_group, "zone_geometry_snapshot", None),
        "template_snapshot": getattr(route_group, "template_snapshot", None),
        "actual_start_time": route_group.actual_start_time,
        "actual_end_time": route_group.actual_end_time,
        "updated_at": route_group.updated_at.isoformat() if route_group.updated_at else None,
        "driver_id": route_group.driver_id,
        "driver": {
            "id": driver.id,
            "username": driver.username,
            "email": driver.email,
        }
        if driver is not None
        else None,
        "route_plan_id": route_group.route_plan_id,
        "state": {
            "id": state.id,
            "name": state.name,
        }
        if state is not None
        else None,
        "total_orders": route_group.total_orders,
        "zone": {
            "id": zone.id,
            "name": zone.name,
            "city_key": zone.city_key,
            "geometry": zone.geometry,
        }
        if zone is not None
        else None,
        "active_route_solution": _serialize_selected_route_solution(route_group),
    }


def list_route_groups(route_plan_id: int, ctx: ServiceContext) -> dict:
    """
    Returns the route groups attached to a route plan.
    """
    try:
        route_plan: RoutePlan = get_instance(ctx=ctx, model=RoutePlan, value=route_plan_id)
    except NoResultFound:
        raise NotFound(f"Route plan {route_plan_id} not found.")

    route_groups = list(route_plan.route_groups or [])
    serialized = [_serialize_route_group(route_group) for route_group in route_groups]

    return {
        "route_plan_id": route_plan_id,
        "route_groups": serialized,
    }
