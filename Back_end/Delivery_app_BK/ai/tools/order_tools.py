"""
Order-domain tools.
Implements: list_orders, create_order, update_order, update_order_state,
            assign_orders_to_plan, assign_orders_to_route_group.

Status: SKELETON - implementations added in Phase 2.
"""
from __future__ import annotations

from Delivery_app_BK.services.context import ServiceContext


def list_orders_tool(ctx: ServiceContext, **kwargs) -> dict:
    raise NotImplementedError("list_orders_tool - Phase 2")


def create_order_tool(ctx: ServiceContext, **kwargs) -> dict:
    raise NotImplementedError("create_order_tool - Phase 2")


def update_order_tool(ctx: ServiceContext, order_id: int, **kwargs) -> dict:
    raise NotImplementedError("update_order_tool - Phase 2")


def update_order_state_tool(ctx: ServiceContext, order_ids: list[int], state: str) -> dict:
    raise NotImplementedError("update_order_state_tool - Phase 2")


def assign_orders_to_plan_tool(ctx: ServiceContext, order_ids: list[int], plan_id: int) -> dict:
    raise NotImplementedError("assign_orders_to_plan_tool - Phase 2")


def assign_orders_to_route_group_tool(
    ctx: ServiceContext, order_ids: list[int], route_group_id: int
) -> dict:
    raise NotImplementedError("assign_orders_to_route_group_tool - Phase 2")
