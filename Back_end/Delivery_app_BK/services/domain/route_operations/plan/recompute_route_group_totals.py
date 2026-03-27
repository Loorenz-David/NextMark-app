"""Recompute total_orders for zone-backed route groups belonging to a route plan."""
from __future__ import annotations

from sqlalchemy import func

from Delivery_app_BK.models import Order, OrderZoneAssignment, RouteGroup, db


def recompute_route_group_totals(plan) -> None:
    """Refresh RouteGroup.total_orders for the provided plan. Does not commit."""
    if plan is None or getattr(plan, "id", None) is None:
        return

    route_groups = (
        db.session.query(RouteGroup)
        .filter(
            RouteGroup.route_plan_id == plan.id,
            RouteGroup.zone_id.isnot(None),
        )
        .all()
    )
    if not route_groups:
        return

    zone_ids = [route_group.zone_id for route_group in route_groups if route_group.zone_id is not None]
    orders_per_zone = {
        zone_id: count
        for zone_id, count in (
            db.session.query(OrderZoneAssignment.zone_id, func.count(OrderZoneAssignment.id))
            .join(Order, Order.id == OrderZoneAssignment.order_id)
            .filter(
                Order.route_plan_id == plan.id,
                Order.team_id == plan.team_id,
                OrderZoneAssignment.team_id == plan.team_id,
                OrderZoneAssignment.is_unassigned.is_(False),
                OrderZoneAssignment.zone_id.in_(zone_ids),
            )
            .group_by(OrderZoneAssignment.zone_id)
            .all()
        )
    }

    for route_group in route_groups:
        route_group.total_orders = int(orders_per_zone.get(route_group.zone_id, 0))