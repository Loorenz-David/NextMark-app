"""
Plan execution status - strategy registry.
Dispatches get_plan_execution_status to the correct handler per plan type.
"""
from __future__ import annotations

from Delivery_app_BK.services.context import ServiceContext
from Delivery_app_BK.models.tables.route_operations.route_plan.route_plan import RoutePlan

from . import local_delivery_handler, international_shipping_handler, store_pickup_handler

HANDLERS: dict[str, object] = {
    "local_delivery":           local_delivery_handler.get_execution_status,
    "international_shipping":   international_shipping_handler.get_execution_status,
    "store_pickup":             store_pickup_handler.get_execution_status,
}


def get_handler(plan_type: str):
    handler = HANDLERS.get(plan_type)
    if handler is None:
        raise ValueError(f"No execution status handler for plan type: {plan_type!r}")
    return handler
