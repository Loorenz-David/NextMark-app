from Delivery_app_BK.models import RouteGroup
from Delivery_app_BK.services.context import ServiceContext
from Delivery_app_BK.services.queries.utils import map_return_values


def _serialize_route_group_item(instance: RouteGroup) -> dict:
    state = getattr(instance, "state", None)
    return {
        "id": instance.id,
        "client_id": instance.client_id,
        "name": getattr(instance, "name", None),
        "zone_id": getattr(instance, "zone_id", None),
        "zone_geometry_snapshot": getattr(instance, "zone_geometry_snapshot", None),
        "template_snapshot": getattr(instance, "template_snapshot", None),
        "actual_start_time": instance.actual_start_time,
        "actual_end_time": instance.actual_end_time,
        "updated_at": instance.updated_at.isoformat() if instance.updated_at else None,
        "driver_id": instance.driver_id,
        "route_plan_id": instance.route_plan_id,
        "state": {
            "id": state.id,
            "name": state.name,
        }
        if state is not None
        else None,
        "total_orders": instance.total_orders,
    }


def serialize_route_group(instance: RouteGroup, ctx: ServiceContext):
    unpacked_instances = [_serialize_route_group_item(instance)]
    mapped_instances = map_return_values(unpacked_instances, ctx, "route_group")
    return mapped_instances[0] if isinstance(mapped_instances, list) else mapped_instances


def serialize_route_groups(instances: list[RouteGroup], ctx: ServiceContext):
    unpacked_instances = [_serialize_route_group_item(instance) for instance in instances]

    return map_return_values(unpacked_instances, ctx, "route_group")
