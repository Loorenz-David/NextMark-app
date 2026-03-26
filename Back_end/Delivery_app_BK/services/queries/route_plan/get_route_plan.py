from Delivery_app_BK.services.queries.delivery_plan.get_plan import get_plan


def get_route_plan(plan_id: int, ctx):
    return get_plan(plan_id, ctx)


__all__ = ["get_route_plan", "get_plan"]
