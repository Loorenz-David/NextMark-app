from __future__ import annotations
import logging

from Delivery_app_BK.services.context import ServiceContext
from Delivery_app_BK.services.commands.order.update_order_delivery_plan import (
    update_orders_delivery_plan,
)
from Delivery_app_BK.services.queries.order.list_orders import (
    list_orders as list_orders_service,
)

logger = logging.getLogger(__name__)


def list_orders_tool(
    ctx: ServiceContext,
    plan_id: int | None = None,
    # free-text search
    q: str | None = None,
    s: list[str] | None = None,
    # schedule state
    scheduled: bool | None = None,
    show_archived: bool | None = None,
    # identity filters
    order_state_id: int | list[int] | None = None,
    # date filters
    creation_date_from: str | None = None,
    creation_date_to: str | None = None,
    # pagination
    limit: int | None = None,
    sort: str | None = None,
) -> dict:
    """List orders with full filter support."""
    filters: dict = {}

    if q is not None:
        filters["q"] = q
    if s is not None:
        filters["s"] = s
    if scheduled is True:
        filters["schedule_order"] = True
    elif scheduled is False:
        filters["unschedule_order"] = True
    if show_archived is not None:
        filters["show_archived"] = str(show_archived).lower()
    if order_state_id is not None:
        filters["order_state_id"] = order_state_id
    if creation_date_from is not None:
        filters["creation_date_from"] = creation_date_from
    if creation_date_to is not None:
        filters["creation_date_to"] = creation_date_to
    if limit is not None:
        filters["limit"] = limit
    if sort is not None:
        filters["sort"] = sort

    ctx.query_params = {**ctx.query_params, **filters}
    return list_orders_service(ctx, plan_id=plan_id)


def assign_orders_to_plan_tool(
    ctx: ServiceContext,
    order_ids: list[int],
    plan_id: int,
) -> dict:
    """
    Assign a list of orders to a delivery plan.
    This is how orders get 'scheduled' — by linking them to a plan.
    Always call find_plans_for_schedule or create_plan first to get the plan_id.
    """
    if not order_ids:
        return {"status": "no_orders", "assigned": 0}

    result = update_orders_delivery_plan(ctx, order_ids, plan_id)
    updated = result.get("updated") or []

    logger.info(
        "assign_orders_to_plan_tool | plan_id=%s | requested=%d | assigned=%d",
        plan_id,
        len(order_ids),
        len(updated),
    )
    return {
        "status": "assigned",
        "plan_id": plan_id,
        "requested": len(order_ids),
        "assigned": len(updated),
    }


def assign_orders_tool(ctx: ServiceContext, plan_id: int, order_ids: list) -> dict:
    """Alias kept for compatibility. Use assign_orders_to_plan instead."""
    return assign_orders_to_plan_tool(ctx, order_ids=order_ids, plan_id=plan_id)
