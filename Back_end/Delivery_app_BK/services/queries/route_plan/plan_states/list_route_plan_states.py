from Delivery_app_BK.services.queries.delivery_plan.plan_states.list_plan_states import (
    list_plan_states,
)


def list_route_plan_states(ctx):
    return list_plan_states(ctx)


__all__ = ["list_route_plan_states", "list_plan_states"]
