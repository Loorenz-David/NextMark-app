from Delivery_app_BK.models import db, Item, Order
from ....context import ServiceContext
from ...base.delete_instance import delete_instance
from ...utils import extract_ids
from ....queries.get_instance import get_instance
from Delivery_app_BK.services.domain.item.order_item_freshness import (
    touch_orders_items_updated_at,
)
from Delivery_app_BK.services.domain.plan.route_freshness import touch_route_freshness_by_order
from Delivery_app_BK.services.infra.events.builders.order import build_order_edited_event
from Delivery_app_BK.services.infra.events.emiters.order import emit_order_events


def delete_item(ctx: ServiceContext):
    instances = []
    touched_orders: list[Order] = []
    for target_id in extract_ids(ctx):
        item = get_instance(ctx, Item, target_id)
        if item.order is not None:
            touched_orders.append(item.order)
        instances.append(delete_instance(ctx, Item, target_id))
    touch_orders_items_updated_at(touched_orders)
    for order in _unique_orders(touched_orders):
        touch_route_freshness_by_order(order)
    db.session.commit()
    _emit_item_update_events(ctx, touched_orders)
    return instances


def _unique_orders(orders: list[Order]) -> list[Order]:
    unique_by_id: dict[int, Order] = {}
    for order in orders:
        if order is None or getattr(order, "id", None) is None:
            continue
        unique_by_id[order.id] = order
    return list(unique_by_id.values())


def _emit_item_update_events(ctx: ServiceContext, orders: list[Order]) -> None:
    unique_orders = _unique_orders(orders)
    if not unique_orders:
        return

    emit_order_events(
        ctx,
        [
            build_order_edited_event(order, changed_sections=["items"])
            for order in unique_orders
        ],
    )
