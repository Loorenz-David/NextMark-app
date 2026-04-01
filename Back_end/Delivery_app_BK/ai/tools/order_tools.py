"""
Order-domain tools.
Implements: list_orders, create_order, update_order, update_order_state,
            assign_orders_to_plan, assign_orders_to_route_group.

Status: SKELETON - implementations added in Phase 2.
"""
from __future__ import annotations

from Delivery_app_BK.ai.prompts.system_prompt import ORDER_STATE_MAP
from Delivery_app_BK.services.context import ServiceContext
from Delivery_app_BK.services.queries.order.list_orders import list_orders

_ORDER_STATE_NAME_TO_ID: dict[str, int] = ORDER_STATE_MAP
_ORDER_STATE_ID_TO_NAME: dict[int, str] = {v: k for k, v in ORDER_STATE_MAP.items()}

AI_ORDER_LIMIT = 25


def list_orders_tool(
    ctx: ServiceContext,
    plan_id: int | None = None,
    route_group_id: int | None = None,
    zone_id: int | None = None,
    scheduled: bool | None = None,
    state: str | list[str] | None = None,
    operation_type: str | None = None,
    order_plan_objective: str | None = None,
    q: str | None = None,
    limit: int = AI_ORDER_LIMIT,
    sort: str = "date_desc",
) -> dict:
    """List orders with optional filters. Returns compact order summaries."""
    params: dict = {
        "limit": min(int(limit), AI_ORDER_LIMIT),
        "sort": sort,
    }

    if q:
        params["q"] = q.strip()

    if scheduled is True:
        params["schedule_order"] = True
    elif scheduled is False:
        params["unschedule_order"] = True

    if state is not None:
        names = [state] if isinstance(state, str) else list(state)
        ids = []
        unknown = []
        for name in names:
            sid = _ORDER_STATE_NAME_TO_ID.get(name)
            if sid is not None:
                ids.append(sid)
            else:
                unknown.append(name)
        if unknown:
            return {
                "error": f"Unknown order state(s): {unknown}. "
                f"Valid states: {list(_ORDER_STATE_NAME_TO_ID.keys())}"
            }
        params["order_state_id"] = ids

    if operation_type:
        params["operation_type"] = operation_type

    if order_plan_objective:
        params["order_plan_objective"] = order_plan_objective

    if zone_id is not None:
        params["zone_id"] = zone_id

    tool_ctx = ServiceContext(query_params=params, identity=ctx.identity)

    result = list_orders(
        ctx=tool_ctx,
        route_plan_id=plan_id,
        route_group_id=route_group_id,
    )

    raw_orders = result.get("order") or []
    stats = result.get("order_stats") or {}
    pagination = result.get("order_pagination") or {}

    orders = []
    for o in raw_orders:
        state_id = o.get("order_state_id")
        orders.append({
            "id": o.get("id"),
            "reference_number": o.get("reference_number"),
            "client_name": " ".join(
                filter(None, [o.get("client_first_name"), o.get("client_last_name")])
            ) or None,
            "state": _ORDER_STATE_ID_TO_NAME.get(state_id, str(state_id)),
            "plan_id": o.get("delivery_plan_id"),
            "route_group_id": o.get("route_group_id"),
            "operation_type": o.get("operation_type"),
            "order_plan_objective": o.get("order_plan_objective"),
            "item_type_counts": o.get("item_type_counts"),
            "total_items": o.get("total_items"),
        })

    by_state_raw = (stats.get("orders") or {}).get("by_state") or {}
    by_state = {
        _ORDER_STATE_ID_TO_NAME.get(int(k), str(k)): v
        for k, v in by_state_raw.items()
    }

    return {
        "count": len(orders),
        "total": (stats.get("orders") or {}).get("total"),
        "by_state": by_state,
        "has_more": pagination.get("has_more", False),
        "orders": orders,
        "filters_applied": {
            k: v for k, v in {
                "plan_id": plan_id,
                "route_group_id": route_group_id,
                "zone_id": zone_id,
                "scheduled": scheduled,
                "state": state,
                "operation_type": operation_type,
                "order_plan_objective": order_plan_objective,
                "q": q,
            }.items() if v is not None
        },
    }


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
