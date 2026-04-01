"""
Execution status handler for international_shipping plans.
Status: STUB - future vendor/carrier API integration.
"""
from __future__ import annotations

from Delivery_app_BK.services.context import ServiceContext
from Delivery_app_BK.models.tables.route_operations.route_plan.route_plan import RoutePlan


def get_execution_status(ctx: ServiceContext, plan: RoutePlan) -> dict:
    return {"status": "not_implemented", "plan_type": "international_shipping"}
