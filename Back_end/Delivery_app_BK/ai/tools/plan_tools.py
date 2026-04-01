"""
Plan-domain tools.
Implements: list_plans, get_plan_summary, create_plan, optimize_plan,
            get_plan_execution_status, list_route_groups, materialize_route_groups.

Status: SKELETON - implementations added in Phase 2.
"""
from __future__ import annotations

from Delivery_app_BK.services.context import ServiceContext


# -- list_plans ----------------------------------------------------------------
def list_plans_tool(ctx: ServiceContext, **kwargs) -> dict:
    raise NotImplementedError("list_plans_tool - Phase 2")


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
def list_route_groups_tool(ctx: ServiceContext, plan_id: int, **kwargs) -> dict:
    raise NotImplementedError("list_route_groups_tool - Phase 2")


# -- materialize_route_groups -----------------------------------------------------
def materialize_route_groups_tool(ctx: ServiceContext, plan_id: int) -> dict:
    raise NotImplementedError("materialize_route_groups_tool - Phase 2")
