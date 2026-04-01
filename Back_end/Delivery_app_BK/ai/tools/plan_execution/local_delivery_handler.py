"""
Execution status handler for local_delivery plans.
Returns the selected route, driver, and stop summary for a plan.
Status: SKELETON - Phase 2.
"""
from __future__ import annotations

from Delivery_app_BK.services.context import ServiceContext
from Delivery_app_BK.models.tables.route_operations.route_plan.route_plan import RoutePlan


def get_execution_status(ctx: ServiceContext, plan: RoutePlan) -> dict:
    raise NotImplementedError("local_delivery get_execution_status - Phase 2")
