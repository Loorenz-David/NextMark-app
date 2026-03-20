from __future__ import annotations
import logging

from Delivery_app_BK.route_optimization.orchestrator import optimize_local_delivery_plan
from Delivery_app_BK.services.context import ServiceContext
from Delivery_app_BK.services.queries.plan.get_plan import get_plan as get_plan_service
from Delivery_app_BK.services.queries.plan.list_delivery_plans import (
    list_delivery_plans as list_delivery_plans_service,
)
from Delivery_app_BK.services.commands.plan.create_plan import (
    create_plan as create_plan_service,
)

logger = logging.getLogger(__name__)


def optimize_plan_tool(ctx: ServiceContext, local_delivery_plan_id: int) -> dict:
    """Run route optimization for a local delivery plan."""
    ctx.incoming_data["local_delivery_plan_id"] = local_delivery_plan_id
    outcome = optimize_local_delivery_plan(ctx)
    if outcome.error:
        raise outcome.error
    return outcome.data or {"status": "optimized"}


def get_plan_summary_tool(ctx: ServiceContext, plan_id: int) -> dict:
    """Get details of a delivery plan by ID."""
    return get_plan_service(plan_id, ctx)


def list_plans_tool(
    ctx: ServiceContext,
    label: str | None = None,
    plan_type: str | None = None,
    start_date: str | None = None,
    end_date: str | None = None,
    covers_start: str | None = None,
    covers_end: str | None = None,
    plan_state_id: int | None = None,
    max_orders: int | None = None,
    min_orders: int | None = None,
    limit: int | None = None,
) -> dict:
    """List delivery plans with optional filters."""
    filters = {}
    if label is not None:
        filters["label"] = label
    if plan_type is not None:
        filters["plan_type"] = plan_type
    if start_date is not None:
        filters["start_date"] = start_date
    if end_date is not None:
        filters["end_date"] = end_date
    if covers_start is not None:
        filters["covers_start"] = covers_start
    if covers_end is not None:
        filters["covers_end"] = covers_end
    if plan_state_id is not None:
        filters["plan_state_id"] = plan_state_id
    if max_orders is not None:
        filters["max_orders"] = max_orders
    if min_orders is not None:
        filters["min_orders"] = min_orders
    if limit is not None:
        filters["limit"] = limit
    ctx.query_params = {**ctx.query_params, **filters}
    return list_delivery_plans_service(ctx)


def create_plan_tool(
    ctx: ServiceContext,
    label: str,
    start_date: str,
    end_date: str,
    plan_type: str = "local_delivery",
) -> dict:
    """
    Create a new delivery plan.
    Returns the created plan with its ID — use the ID immediately to assign orders.
    """
    ctx.incoming_data = {
        "fields": {
            "label": label,
            "plan_type": plan_type,
            "start_date": start_date,
            "end_date": end_date,
        }
    }
    result = create_plan_service(ctx)
    # result is {"created": [bundles]}; extract the first plan's data
    bundles = result.get("created", []) if isinstance(result, dict) else result
    if isinstance(bundles, list) and bundles:
        bundle = bundles[0]
        plan = bundle.get("delivery_plan") or {}
        return {
            "plan_id": plan.get("id"),
            "label": plan.get("label"),
            "plan_type": plan.get("plan_type"),
            "start_date": plan.get("start_date"),
            "end_date": plan.get("end_date"),
        }
    return {"status": "created", "result": result}
