from __future__ import annotations

from collections.abc import Callable

from ....context import ServiceContext
from ...local_delivery_app import apply_order_delete_extension as handle_local_delivery_order_delete_extension
from ...store_pickup_app import apply_order_delete_extension as handle_store_pickup_order_delete_extension
from ...international_shipping_app import apply_order_delete_extension as handle_international_shipping_order_delete_extension
from .types import OrderDeleteDelta, OrderDeleteExtensionContext, OrderDeleteExtensionResult


OrderDeleteExtensionHandler = Callable[
    [ServiceContext, list[OrderDeleteDelta], OrderDeleteExtensionContext],
    OrderDeleteExtensionResult,
]


PLAN_TYPE_DELETE_EXTENSION_HANDLERS: dict[str, OrderDeleteExtensionHandler] = {
    "local_delivery": handle_local_delivery_order_delete_extension,
    "store_pickup": handle_store_pickup_order_delete_extension,
    "international_shipping": handle_international_shipping_order_delete_extension,
}


def resolve_delete_extension_handler(
    plan_type: str,
) -> OrderDeleteExtensionHandler | None:
    return PLAN_TYPE_DELETE_EXTENSION_HANDLERS.get(plan_type)
