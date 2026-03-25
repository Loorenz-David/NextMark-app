"""
plan_state_engine
=================
Pure-function helpers for deriving and applying delivery-plan states.

None of these functions issue DB commits or flushes — that is the caller's
responsibility.

Rules encoded here:
  - A plan auto-completes when its selected route solution has at least one
    order and all of them are in the Completed state.
  - A plan should reset to Open when its dates, times, or locations are
    changed and it is not already Open.
  - `apply_plan_state` is the single safe setter — it is a no-op when the
    state is already correct.
"""
from __future__ import annotations

import logging
from typing import TYPE_CHECKING

from Delivery_app_BK.services.domain.order.order_states import OrderState as OrderStateEnum
from Delivery_app_BK.services.domain.plan.plan_states import PlanStateId

if TYPE_CHECKING:
    from Delivery_app_BK.models.tables.delivery_plan.delivery_plan import DeliveryPlan
    from Delivery_app_BK.models.tables.delivery_plan.delivery_plan_types.local_delivery_plan.route_solutions.route_solution import RouteSolution

logger = logging.getLogger(__name__)

_COMPLETED_STATE_NAME = OrderStateEnum.COMPLETED.value


def derive_auto_complete_state(route_solution: "RouteSolution | None") -> int | None:
    """
    Return PlanStateId.COMPLETED if all orders in the route solution are
    completed, otherwise return None.

    Preconditions:
      - route_solution.order_count and route_solution.order_state_counts must
        already have been recomputed before calling this function.
    """
    if route_solution is None:
        return None

    total = route_solution.order_count or 0
    if total == 0:
        return None

    counts = route_solution.order_state_counts or {}
    completed = counts.get(_COMPLETED_STATE_NAME, 0)

    if completed >= total:
        return PlanStateId.COMPLETED

    return None


def get_selected_route_solution(plan: "DeliveryPlan") -> "RouteSolution | None":
    """Return the selected RouteSolution for a local_delivery plan, or None."""
    local = getattr(plan, "local_delivery", None)
    if local is None:
        return None

    route_solutions = getattr(local, "route_solutions", None) or []
    selected = next((rs for rs in route_solutions if rs.is_selected), None)
    if selected is None and route_solutions:
        selected = route_solutions[0]
    return selected


def should_reset_plan_to_open(current_state_id: int | None) -> bool:
    """Return True if the plan is in any state other than Open."""
    return current_state_id != PlanStateId.OPEN


def apply_plan_state(plan: "DeliveryPlan", state_id: int) -> bool:
    """
    Set plan.state_id to state_id if it differs.  Returns True when changed.
    Does NOT flush or commit.
    """
    if plan is None:
        return False
    if plan.state_id == state_id:
        return False
    plan.state_id = state_id
    logger.debug(
        "apply_plan_state plan_id=%s %s -> %s",
        plan.id,
        plan.state_id,
        state_id,
    )
    return True


def maybe_auto_complete_plan(plan: "DeliveryPlan") -> bool:
    """
    Check if the plan should auto-transition to COMPLETED and apply it.
    Must be called *after* `recompute_plan_order_counts`.
    Returns True when the plan was transitioned.
    """
    if plan is None or getattr(plan, "plan_type", None) != "local_delivery":
        return False

    # Allows manual completion flows where orders are marked completed
    # without first transitioning the plan to PROCESSING.

    route_solution = get_selected_route_solution(plan)
    auto_state = derive_auto_complete_state(route_solution)
    if auto_state is None:
        return False

    return apply_plan_state(plan, auto_state)
