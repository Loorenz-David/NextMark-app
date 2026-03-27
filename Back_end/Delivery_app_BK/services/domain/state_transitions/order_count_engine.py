"""
order_count_engine
==================
Centralised computation of per-state order counts for route solutions and their
parent delivery plans. Supports multiple plan types via a dispatcher dict so
future plan types (international_shipping, store_pickup, …) only need a new
entry in PLAN_COUNT_HANDLERS.

No commits are issued — callers are responsible for flushing / committing.
"""
from __future__ import annotations

import logging
from collections import defaultdict
from typing import TYPE_CHECKING, Callable

from sqlalchemy.orm import joinedload

from Delivery_app_BK.models import RoutePlan, RouteSolution, RouteSolutionStop, Order, OrderState, db

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Route-solution level
# ---------------------------------------------------------------------------

def recompute_route_solution_order_counts(route_solution: "RouteSolution") -> None:
    """
    Query the DB for all orders currently in this route solution's stops and
    group them by their state name.  Sets:
      - route_solution.order_count  (total distinct orders)
      - route_solution.order_state_counts  (dict[state_name, count])

    Does NOT flush / commit.
    """
    if route_solution is None or route_solution.id is None:
        return

    rows = (
        db.session.query(OrderState.name, db.func.count(Order.id.distinct()))
        .select_from(RouteSolutionStop)
        .join(Order, RouteSolutionStop.order_id == Order.id)
        .join(OrderState, Order.order_state_id == OrderState.id)
        .filter(RouteSolutionStop.route_solution_id == route_solution.id)
        .filter(RouteSolutionStop.order_id.isnot(None))
        .group_by(OrderState.name)
        .all()
    )

    counts: dict[str, int] = {}
    total = 0
    for state_name, count in rows:
        if state_name:
            counts[state_name] = int(count)
            total += int(count)

    route_solution.order_count = total
    route_solution.order_state_counts = counts or None

    logger.debug(
        "recompute_route_solution_order_counts route_id=%s total=%s counts=%s",
        route_solution.id,
        total,
        counts,
    )


# ---------------------------------------------------------------------------
# Plan-type dispatcher
# ---------------------------------------------------------------------------

PlanCountHandler = Callable[["RoutePlan"], None]

def _recompute_local_delivery_counts(plan: "RoutePlan") -> None:
    """Find the *selected* route solution for this local delivery plan and recompute."""
    local = getattr(plan, "local_delivery", None)
    if local is None:
        return

    route_solutions = (
        db.session.query(RouteSolution)
        .filter(RouteSolution.route_group_id == local.id)
        .all()
    )

    for rs in route_solutions:
        recompute_route_solution_order_counts(rs)


# Extend this dict when new plan types gain route-solution–like sub-tables.
_PLAN_COUNT_HANDLERS: dict[str, PlanCountHandler] = {
    "local_delivery": _recompute_local_delivery_counts,
}


def recompute_plan_order_counts(plan: "RoutePlan") -> None:
    """
    Dispatch to the correct plan-type handler to recompute order counts.
    No-ops gracefully if the plan type has no registered handler yet.
    """
    if plan is None or plan.id is None:
        return

    handler = _PLAN_COUNT_HANDLERS.get(getattr(plan, "plan_type", None))
    if handler is None:
        return

    handler(plan)

    logger.debug(
        "recompute_plan_order_counts plan_id=%s plan_type=%s",
        plan.id,
        plan.plan_type,
    )
