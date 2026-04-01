"""
Narrative / observation tools.
These tools synthesize aggregated data into NarrativeBlock lists.
They do NOT mutate state.

Implements: get_plan_snapshot, get_operations_dashboard, get_route_group_snapshot.

Status: SKELETON - implementations added in Phase 3.
"""
from __future__ import annotations

from Delivery_app_BK.services.context import ServiceContext


def get_plan_snapshot_tool(ctx: ServiceContext, plan_id: int) -> dict:
    """
    Returns a structured snapshot of a plan:
      - plan state, date window, total_orders, item_type_counts
      - per route_group: zone name, order count, state distribution, is_optimized
      - warnings: unzoned orders, time window conflicts, capacity breaches
    Result includes a "blocks" list of NarrativeBlock dicts.
    """
    raise NotImplementedError("get_plan_snapshot_tool - Phase 3")


def get_operations_dashboard_tool(ctx: ServiceContext, date: str | None = None) -> dict:
    """
    Returns a cross-plan view of operations for the given date (defaults to today):
      - active plans with state
      - orders in flight (state breakdown)
      - zone utilization overview
      - alerts: failing orders, overdue routes, driver not yet departed
    Result includes a "blocks" list of NarrativeBlock dicts.
    """
    raise NotImplementedError("get_operations_dashboard_tool - Phase 3")


def get_route_group_snapshot_tool(ctx: ServiceContext, route_group_id: int) -> dict:
    """
    Returns a detailed snapshot of a single route group:
      - zone info and template constraints
      - order list with state, items, timing windows
      - active route: driver, stop sequence, ETA compliance
      - warnings: late stops, unreachable windows, capacity exceeded
    Result includes a "blocks" list of NarrativeBlock dicts.
    """
    raise NotImplementedError("get_route_group_snapshot_tool - Phase 3")
