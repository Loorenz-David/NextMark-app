"""
Item-domain tools.
Implements: search_item_types, add_items_to_order.

Status: SKELETON - implementations added in Phase 2.
"""
from __future__ import annotations

from Delivery_app_BK.services.context import ServiceContext


def search_item_types_tool(ctx: ServiceContext, q: str) -> dict:
    raise NotImplementedError("search_item_types_tool - Phase 2")


def add_items_to_order_tool(ctx: ServiceContext, order_id: int, items: list[dict]) -> dict:
    raise NotImplementedError("add_items_to_order_tool - Phase 2")
