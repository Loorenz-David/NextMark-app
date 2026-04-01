"""
Order-domain tools.
Implements: list_orders, create_order, update_order, update_order_state,
            assign_orders_to_plan, assign_orders_to_route_group.

Status: SKELETON - implementations added in Phase 2.
"""
from __future__ import annotations

from Delivery_app_BK.ai.prompts.system_prompt import ORDER_STATE_MAP
from Delivery_app_BK.errors import NotFound
from Delivery_app_BK.models import RouteGroup
from Delivery_app_BK.services.commands.order.create_order import create_order
from Delivery_app_BK.services.commands.order.order_states.update_orders_state import (
    update_orders_state_payload,
)
from Delivery_app_BK.services.commands.order.update_order_route_plan import (
    apply_orders_route_plan_change,
)
from Delivery_app_BK.services.context import ServiceContext
from Delivery_app_BK.services.queries.get_instance import get_instance
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

    tool_ctx = ServiceContext(query_params=params, identity=ctx.identity, on_query_return="list")

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


def create_order_tool(
    ctx: ServiceContext,
    client_first_name: str | None = None,
    client_last_name: str | None = None,
    client_address: dict | None = None,
    order_plan_objective: str | None = None,
    operation_type: str | None = None,
    reference_number: str | None = None,
    delivery_plan_id: int | None = None,
    route_group_id: int | None = None,
    items: list[dict] | None = None,
) -> dict:
    """Create a new order and return a compact summary."""
    fields: dict = {}

    if client_first_name:
        fields["client_first_name"] = client_first_name.strip()
    if client_last_name:
        fields["client_last_name"] = client_last_name.strip()
    if client_address and isinstance(client_address, dict):
        fields["client_address"] = client_address
    if order_plan_objective:
        fields["order_plan_objective"] = order_plan_objective
    if operation_type:
        fields["operation_type"] = operation_type
    if reference_number:
        fields["reference_number"] = reference_number.strip()
    if delivery_plan_id is not None:
        fields["delivery_plan_id"] = delivery_plan_id
    if route_group_id is not None:
        fields["route_group_id"] = route_group_id
    if items:
        fields["items"] = items

    if not fields:
        return {"error": "At least one order field must be provided"}

    tool_ctx = ServiceContext(
        incoming_data={"fields": [fields]},
        identity=ctx.identity,
    )
    result = create_order(tool_ctx)
    created = result.get("created") or []
    if not created:
        return {"error": "Order creation returned no result"}

    bundle = created[0]
    order_data = bundle.get("order") or {}
    return {
        "id": order_data.get("id"),
        "client_id": order_data.get("client_id"),
        "reference_number": order_data.get("reference_number"),
        "order_state_id": order_data.get("order_state_id"),
        "delivery_plan_id": order_data.get("delivery_plan_id"),
        "route_group_id": order_data.get("route_group_id"),
        "order_plan_objective": order_data.get("order_plan_objective"),
        "operation_type": order_data.get("operation_type"),
        "total_items": order_data.get("total_items"),
    }


def update_order_tool(ctx: ServiceContext, order_id: int, **kwargs) -> dict:
    raise NotImplementedError("update_order_tool - Phase 2")


def update_order_state_tool(ctx: ServiceContext, order_ids: list[int], state: str) -> dict:
    """Transition a list of orders to the given state name."""
    if not order_ids:
        return {"error": "order_ids must be a non-empty list"}

    state_id = _ORDER_STATE_NAME_TO_ID.get(state)
    if state_id is None:
        return {
            "error": f"Unknown order state: {state!r}. "
            f"Valid states: {list(_ORDER_STATE_NAME_TO_ID.keys())}"
        }

    payload = update_orders_state_payload(ctx, order_ids, state_id)
    changed_orders = payload.get("order") or []
    return {
        "updated_count": len(changed_orders),
        "target_state": state,
        "order_ids": order_ids,
    }


def assign_orders_to_plan_tool(ctx: ServiceContext, order_ids: list[int], plan_id: int) -> dict:
    """Move a list of orders to the given plan."""
    if not order_ids:
        return {"error": "order_ids must be a non-empty list"}
    if not isinstance(plan_id, int) or plan_id <= 0:
        return {"error": "plan_id must be a positive integer"}

    result = apply_orders_route_plan_change(ctx, order_ids, plan_id)
    updated = result.get("updated") or []
    return {
        "updated_count": len(updated),
        "plan_id": plan_id,
        "order_ids": order_ids,
    }


def assign_orders_to_route_group_tool(
    ctx: ServiceContext, order_ids: list[int], route_group_id: int
) -> dict:
    """Move a list of orders into a specific route group."""
    if not order_ids:
        return {"error": "order_ids must be a non-empty list"}
    if not isinstance(route_group_id, int) or route_group_id <= 0:
        return {"error": "route_group_id must be a positive integer"}

    try:
        route_group = get_instance(ctx, RouteGroup, route_group_id)
    except NotFound:
        return {"error": f"route_group {route_group_id} not found"}

    plan_id = route_group.route_plan_id
    result = apply_orders_route_plan_change(
        ctx, order_ids, plan_id, destination_route_group_id=route_group_id
    )
    updated = result.get("updated") or []
    return {
        "updated_count": len(updated),
        "plan_id": plan_id,
        "route_group_id": route_group_id,
        "order_ids": order_ids,
    }
