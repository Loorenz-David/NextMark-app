from Delivery_app_BK.models import RouteGroup
from ...context import ServiceContext
from ..utils import map_return_values


def serialize_local_delivery_plan(instance: RouteGroup, ctx: ServiceContext):
    unpacked_instances = [{
        "id": instance.id,
        "client_id": instance.client_id,
        "actual_start_time": instance.actual_start_time,
        "actual_end_time": instance.actual_end_time,
        "updated_at": instance.updated_at.isoformat() if instance.updated_at else None,
        "driver_id": instance.driver_id,
        "route_plan_id": instance.route_plan_id,
    }]
    mapped_instances = map_return_values(unpacked_instances, ctx, "local_delivery_plan")
    return mapped_instances[0] if isinstance(mapped_instances, list) else mapped_instances


def serialize_local_delivery_plans(instances: list[RouteGroup], ctx: ServiceContext):
    unpacked_instances = [{
        "id": instance.id,
        "client_id": instance.client_id,
        "actual_start_time": instance.actual_start_time,
        "actual_end_time": instance.actual_end_time,
        "updated_at": instance.updated_at.isoformat() if instance.updated_at else None,
        "driver_id": instance.driver_id,
        "route_plan_id": instance.route_plan_id,
    } for instance in instances]

    return map_return_values(unpacked_instances, ctx, "local_delivery_plan")
