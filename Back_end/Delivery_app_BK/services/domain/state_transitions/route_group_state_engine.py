"""Pure helpers for deriving/applying route-group state from its orders."""

from __future__ import annotations

from Delivery_app_BK.services.domain.order.order_states import OrderStateId
from Delivery_app_BK.services.domain.route_operations.plan.plan_states import PlanStateId


def apply_route_group_state(route_group, state_id: int) -> bool:
    """Idempotent safe setter that returns True when state changed."""
    if route_group.state_id == state_id:
        return False
    route_group.state_id = state_id
    return True


def derive_route_group_state(route_group) -> int:
    """Derive RouteGroup state from active (non-cancelled) orders."""
    active_orders = [
        order
        for order in (route_group.orders or [])
        if order.order_state_id != OrderStateId.CANCELLED
    ]
    if not active_orders:
        return PlanStateId.OPEN

    state_ids = {order.order_state_id for order in active_orders}
    if state_ids == {OrderStateId.COMPLETED}:
        return PlanStateId.COMPLETED
    if state_ids == {OrderStateId.PROCESSING}:
        return PlanStateId.PROCESSING
    if state_ids == {OrderStateId.READY}:
        return PlanStateId.READY
    return PlanStateId.OPEN


def maybe_sync_route_group_state(route_group) -> bool:
    """Derive and apply RouteGroup state, returning True when changed."""
    derived_state_id = derive_route_group_state(route_group)
    return apply_route_group_state(route_group, derived_state_id)
