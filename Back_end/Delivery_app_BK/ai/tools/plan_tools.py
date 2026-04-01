"""
Plan-domain tools.
Implements: list_plans, get_plan_summary, create_plan, optimize_plan,
            get_plan_execution_status, list_route_groups, materialize_route_groups.

Status: SKELETON - implementations added in Phase 2.
"""
from __future__ import annotations

from Delivery_app_BK.ai.prompts.system_prompt import PLAN_STATE_MAP
from Delivery_app_BK.errors import NotFound
from Delivery_app_BK.models import RouteGroup, RoutePlan
from Delivery_app_BK.services.context import ServiceContext
from Delivery_app_BK.services.queries.route_plan.find_plans import find_plans
from Delivery_app_BK.services.queries.route_plan.route_groups.list_route_groups import (
    list_route_groups,
)
from Delivery_app_BK.services.queries.route_plan.serialize_plan import serialize_plans

_PLAN_STATE_NAME_TO_ID: dict[str, int] = PLAN_STATE_MAP
_PLAN_STATE_ID_TO_NAME: dict[int, str] = {v: k for k, v in PLAN_STATE_MAP.items()}

AI_PLAN_LIMIT = 20


# -- list_plans ----------------------------------------------------------------
def list_plans_tool(
    ctx: ServiceContext,
    label: str | None = None,
    state: str | None = None,
    covers_date: str | None = None,
    covers_start: str | None = None,
    covers_end: str | None = None,
    start_date: str | None = None,
    end_date: str | None = None,
    min_orders: int | None = None,
    max_orders: int | None = None,
    limit: int = AI_PLAN_LIMIT,
    sort: str = "date_desc",
) -> dict:
    """List plans with optional filters. Returns plan summaries with route group counts."""
    params: dict = {
        "limit": min(int(limit), AI_PLAN_LIMIT),
        "sort": sort,
    }

    if label:
        params["label"] = label.strip()

    if state is not None:
        sid = _PLAN_STATE_NAME_TO_ID.get(state)
        if sid is None:
            return {
                "error": f"Unknown plan state: {state!r}. "
                f"Valid states: {list(_PLAN_STATE_NAME_TO_ID.keys())}"
            }
        params["state_id"] = sid

    if covers_date:
        params["covers_start"] = covers_date
        params["covers_end"] = covers_date
    else:
        if covers_start:
            params["covers_start"] = covers_start
        if covers_end:
            params["covers_end"] = covers_end

    if start_date:
        params["start_date"] = start_date
    if end_date:
        params["end_date"] = end_date
    if min_orders is not None:
        params["min_orders"] = int(min_orders)
    if max_orders is not None:
        params["max_orders"] = int(max_orders)

    if ctx.team_id:
        params["team_id"] = ctx.team_id

    tool_ctx = ServiceContext(query_params=params, identity=ctx.identity)

    from sqlalchemy.orm import selectinload

    query = find_plans(params, tool_ctx).options(
        selectinload(RoutePlan.route_groups).selectinload(RouteGroup.state)
    )
    plans = query.limit(AI_PLAN_LIMIT + 1).all()
    has_more = len(plans) > AI_PLAN_LIMIT
    page = plans[:AI_PLAN_LIMIT]

    serialized = serialize_plans(page, tool_ctx, include_route_groups_summary=True)
    if not isinstance(serialized, list):
        serialized = [serialized] if serialized else []

    result_plans = []
    for p in serialized:
        state_id = p.get("state_id")
        result_plans.append({
            "id": p.get("id"),
            "label": p.get("label"),
            "state": _PLAN_STATE_ID_TO_NAME.get(state_id, str(state_id)),
            "date_strategy": p.get("date_strategy"),
            "start_date": p.get("start_date"),
            "end_date": p.get("end_date"),
            "total_orders": p.get("total_orders"),
            "total_items": p.get("total_items"),
            "group_count": p.get("route_groups_count"),
            "route_groups": [
                {
                    "id": g.get("id"),
                    "name": g.get("name"),
                    "zone_id": g.get("zone_id"),
                    "total_orders": g.get("total_orders"),
                    "state": _PLAN_STATE_ID_TO_NAME.get(
                        (g.get("state") or {}).get("id"), "Unknown"
                    ),
                }
                for g in (p.get("route_groups") or [])
            ],
        })

    return {
        "count": len(result_plans),
        "has_more": has_more,
        "plans": result_plans,
        "filters_applied": {
            k: v for k, v in {
                "label": label,
                "state": state,
                "covers_date": covers_date,
                "covers_start": covers_start,
                "covers_end": covers_end,
                "min_orders": min_orders,
                "max_orders": max_orders,
            }.items() if v is not None
        },
    }


# -- get_plan_summary ------------------------------------------------------------
def get_plan_summary_tool(ctx: ServiceContext, plan_id: int) -> dict:
    raise NotImplementedError("get_plan_summary_tool - Phase 2")


# -- create_plan -----------------------------------------------------------------
def create_plan_tool(ctx: ServiceContext, **kwargs) -> dict:
    raise NotImplementedError("create_plan_tool - Phase 2")


# -- optimize_plan ----------------------------------------------------------------
def optimize_plan_tool(ctx: ServiceContext, plan_id: int) -> dict:
    raise NotImplementedError("optimize_plan_tool - Phase 2")


# -- get_plan_execution_status ----------------------------------------------------
def get_plan_execution_status_tool(ctx: ServiceContext, plan_id: int) -> dict:
    raise NotImplementedError("get_plan_execution_status_tool - Phase 2")


# -- list_route_groups ------------------------------------------------------------
def list_route_groups_tool(ctx: ServiceContext, plan_id: int) -> dict:
    """Returns all route groups for a plan, with zone info and active route summary."""
    try:
        result = list_route_groups(plan_id, ctx)
    except NotFound as exc:
        return {"error": str(exc)}

    groups = result.get("route_groups", [])

    return {
        "plan_id": plan_id,
        "count": len(groups),
        "route_groups": [
            {
                "id": g.get("id"),
                "name": (g.get("zone_snapshot") or {}).get("name") or "No Zone",
                "zone_id": g.get("zone_id"),
                "state": (g.get("state") or {}).get("name"),
                "total_orders": g.get("total_orders"),
                "item_type_counts": g.get("item_type_counts"),
                "has_active_route": g.get("active_route_solution") is not None,
                "is_optimized": (g.get("active_route_solution") or {}).get("is_optimized"),
                "stop_count": (g.get("active_route_solution") or {}).get("stop_count"),
            }
            for g in groups
        ],
    }


# -- materialize_route_groups -----------------------------------------------------
def materialize_route_groups_tool(ctx: ServiceContext, plan_id: int) -> dict:
    raise NotImplementedError("materialize_route_groups_tool - Phase 2")
