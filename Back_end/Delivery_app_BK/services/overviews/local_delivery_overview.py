from Delivery_app_BK.errors import ValidationFailed
from Delivery_app_BK.models import RoutePlan

from Delivery_app_BK.services.context import ServiceContext
from Delivery_app_BK.services.queries.get_instance import get_instance
from Delivery_app_BK.services.queries.order.serialize_order import serialize_orders
from Delivery_app_BK.services.queries.route_plan.plan_types.serialize_route_group import (
    serialize_route_group,
)
from Delivery_app_BK.services.queries.route_solutions import (
    serialize_route_solution_stops,
    serialize_route_solutions_mixed,
)


def local_delivery_overview(ctx: ServiceContext, plan_id: int):
    plan:RoutePlan = get_instance(ctx=ctx, model=RoutePlan, value=plan_id)
    if plan.plan_type != "local_delivery":
        raise ValidationFailed("Plan is not a local delivery route plan.")

    route_group = plan.local_delivery
    if not route_group:
        raise ValidationFailed("Route group not found.")

    selected_route_solution = next(
        (solution for solution in (route_group.route_solutions or []) if solution.is_selected),
        None,
    )
    if not selected_route_solution:
        route_solutions = sorted(
            list(route_group.route_solutions or []),
            key=lambda solution: (
                getattr(solution, "id", 10**9),
                getattr(solution, "client_id", ""),
            ),
        )
        if not route_solutions:
            raise ValidationFailed("Route group has no route solutions.")
        selected_route_solution = route_solutions[0]
        ctx.set_warning(
            "Route group had no selected route solution. Falling back to the first available route."
        )

    orders = list(plan.orders or [])
    stops = list(selected_route_solution.stops or [])
    other_route_solutions = [
        solution
        for solution in (route_group.route_solutions or [])
        if solution.id != selected_route_solution.id
    ]

    return {
        "order": serialize_orders(orders, ctx),
        "route_group": serialize_route_group(route_group, ctx),
        "route_solution": serialize_route_solutions_mixed(
            selected_route_solution,
            other_route_solutions,
            ctx,
        ),
        "route_solution_stop": serialize_route_solution_stops(stops, ctx),
    }
