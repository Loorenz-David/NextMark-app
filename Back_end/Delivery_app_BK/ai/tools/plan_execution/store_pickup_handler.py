"""
Execution status handler for store_pickup plans.
Status: STUB - future pickup slot info integration.
"""
from __future__ import annotations

from Delivery_app_BK.services.context import ServiceContext
from Delivery_app_BK.models.tables.route_operations.route_plan.route_plan import RoutePlan


def get_execution_status(ctx: ServiceContext, plan: RoutePlan) -> dict:
    return {"status": "not_implemented", "plan_type": "store_pickup"}
