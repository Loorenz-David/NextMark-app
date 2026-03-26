from __future__ import annotations

from collections.abc import Callable

from ....context import ServiceContext
from ...local_delivery_app import apply_order_update_extension as handle_local_delivery_order_update_extension
from ...store_pickup_app import apply_order_update_extension as handle_store_pickup_order_update_extension
from ...international_shipping_app import apply_order_update_extension as handle_international_shipping_order_update_extension
from .types import OrderUpdateDelta, OrderUpdateExtensionContext, OrderUpdateExtensionResult


OrderUpdateExtensionHandler = Callable[
    [ServiceContext, list[OrderUpdateDelta], OrderUpdateExtensionContext],
    OrderUpdateExtensionResult,
]


PLAN_TYPE_UPDATE_EXTENSION_HANDLERS: dict[str, OrderUpdateExtensionHandler] = {
    "local_delivery": handle_local_delivery_order_update_extension,
    "store_pickup": handle_store_pickup_order_update_extension,
    "international_shipping": handle_international_shipping_order_update_extension,
}


def resolve_update_extension_handler(
    plan_type: str,
) -> OrderUpdateExtensionHandler | None:
    return PLAN_TYPE_UPDATE_EXTENSION_HANDLERS.get(plan_type)
