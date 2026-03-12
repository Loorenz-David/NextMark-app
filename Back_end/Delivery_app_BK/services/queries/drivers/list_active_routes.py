from sqlalchemy.orm import selectinload

from Delivery_app_BK.models import LocalDeliveryPlan, Order, RouteSolution, db
from Delivery_app_BK.services.context import ServiceContext
from Delivery_app_BK.services.queries.drivers.serialize_active_routes import (
    serialize_active_routes,
)
from Delivery_app_BK.services.queries.order.serialize_order import (
    serialize_orders_with_items,
)
from Delivery_app_BK.services.queries.route_solutions import (
    serialize_route_solution_stops,
)
from Delivery_app_BK.services.utils import require_team_id


def list_active_routes(ctx: ServiceContext):
    team_id = require_team_id(ctx)

    route_solutions = (
        db.session.query(RouteSolution)
        .options(
            selectinload(RouteSolution.local_delivery_plan).selectinload(
                LocalDeliveryPlan.delivery_plan
            ),
            selectinload(RouteSolution.stops),
        )
        .filter(
            RouteSolution.team_id == team_id,
            RouteSolution.driver_id == ctx.user_id,
            RouteSolution.is_selected.is_(True),
        )
        .order_by(RouteSolution.created_at.desc(), RouteSolution.id.desc())
        .all()
    )

    order_ids = set()
    stops = []

    for route_solution in route_solutions:
        route_stops = list(getattr(route_solution, "stops", None) or [])
        stops.extend(route_stops)

        for stop in route_stops:
            if stop.order_id is not None:
                order_ids.add(stop.order_id)

    orders = []
    if order_ids:
        orders = (
            db.session.query(Order)
            .options(
                selectinload(Order.items),
                selectinload(Order.delivery_windows),
                selectinload(Order.order_cases),
            )
            .filter(
                Order.team_id == team_id,
                Order.id.in_(order_ids),
            )
            .all()
        )

    return {
        "routes": serialize_active_routes(
            instances=route_solutions,
            ctx=ctx,
        ),
        "orders": serialize_orders_with_items(
            instances=orders,
            ctx=ctx,
        ),
        "stops": serialize_route_solution_stops(
            instances=stops,
            ctx=ctx,
        ),
    }
