"""Recompute total_orders for route groups belonging to a route plan."""
from __future__ import annotations

from sqlalchemy import func

from Delivery_app_BK.models import Order, OrderZoneAssignment, RouteGroup, db


def recompute_route_group_totals(plan) -> None:
    """Refresh RouteGroup.total_orders for the provided plan. Does not commit.

    Two paths are executed in one pass:
    - **Zone-backed groups** (zone_id IS NOT NULL): count via OrderZoneAssignment
      so that orders are attributed to their zone regardless of route_group_id.
    - **No-Zone bucket** (zone_id IS NULL): count directly from Order.route_group_id
      because unassigned orders have no zone assignment to join on.
    """
    if plan is None or getattr(plan, "id", None) is None:
        return

    all_groups = (
        db.session.query(RouteGroup)
        .filter(RouteGroup.route_plan_id == plan.id)
        .all()
    )
    if not all_groups:
        return

    # ── Path 1: zone-backed groups ──────────────────────────────────────────
    zone_groups = [g for g in all_groups if g.zone_id is not None]
    if zone_groups:
        zone_ids = [g.zone_id for g in zone_groups]
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
        for group in zone_groups:
            group.total_orders = int(orders_per_zone.get(group.zone_id, 0))

    # ── Path 2: No-Zone bucket(s) ───────────────────────────────────────────
    no_zone_groups = [g for g in all_groups if g.zone_id is None]
    for group in no_zone_groups:
        count = (
            db.session.query(func.count(Order.id))
            .filter(
                Order.route_plan_id == plan.id,
                Order.route_group_id == group.id,
                Order.team_id == plan.team_id,
            )
            .scalar()
        ) or 0
        group.total_orders = int(count)