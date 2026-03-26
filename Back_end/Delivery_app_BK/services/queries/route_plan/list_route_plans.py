from Delivery_app_BK.services.queries.delivery_plan.list_delivery_plans import (
    list_delivery_plans,
)


def list_route_plans(ctx):
    return list_delivery_plans(ctx)


__all__ = ["list_route_plans", "list_delivery_plans"]
