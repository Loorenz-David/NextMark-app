"""
Item-domain tools.
Implements: search_item_types, add_items_to_order.

Status: SKELETON - implementations added in Phase 2.
"""
from __future__ import annotations

from Delivery_app_BK.services.commands.item.create.create_item import create_item
from Delivery_app_BK.services.context import ServiceContext
from Delivery_app_BK.services.queries.item_type.list_item_types import list_item_types

AI_ITEM_TYPE_LIMIT = 20


def search_item_types_tool(
    ctx: ServiceContext,
    q: str,
    limit: int = AI_ITEM_TYPE_LIMIT,
) -> dict:
    """Search item types by name prefix."""
    params: dict = {"limit": min(int(limit), AI_ITEM_TYPE_LIMIT)}
    if q and q.strip():
        params["name"] = q.strip()

    tool_ctx = ServiceContext(
        query_params=params,
        identity=ctx.identity,
        on_query_return="list",
    )
    result = list_item_types(tool_ctx)
    raw = result.get("item_types") or []
    pagination = result.get("item_types_pagination") or {}

    return {
        "count": len(raw),
        "has_more": pagination.get("has_more", False),
        "q": q,
        "item_types": [
            {
                "id": t.get("id"),
                "client_id": t.get("client_id"),
                "name": t.get("name"),
                "property_ids": t.get("properties") or [],
            }
            for t in raw
        ],
    }


def add_items_to_order_tool(ctx: ServiceContext, order_id: int, items: list[dict]) -> dict:
    """Add one or more items to an existing order."""
    if not isinstance(order_id, int) or order_id <= 0:
        return {"error": "order_id must be a positive integer"}
    if not items or not isinstance(items, list):
        return {"error": "items must be a non-empty list"}

    fields = [{"order_id": order_id, **item} for item in items]

    tool_ctx = ServiceContext(
        incoming_data={"fields": fields},
        identity=ctx.identity,
        on_create_return="ids",
    )
    result = create_item(tool_ctx)
    item_ids = result.get("item") or []
    affected_orders = result.get("_affected_orders") or []

    return {
        "order_id": order_id,
        "created_count": len(item_ids),
        "item_ids": item_ids,
        "order_totals_recomputed": len(affected_orders) > 0,
    }
