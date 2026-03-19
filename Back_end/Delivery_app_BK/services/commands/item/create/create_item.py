from Delivery_app_BK.models import (
    db,
    Item,
    Order,
    ItemState,
    ItemPosition,
    Team
)
from ....context import ServiceContext
from ...base.create_instance import create_instance
from ...utils import extract_fields, build_create_result
from Delivery_app_BK.services.domain.item.order_item_freshness import (
    touch_orders_items_updated_at,
)
from Delivery_app_BK.services.domain.plan.route_freshness import touch_route_freshness_by_order
from Delivery_app_BK.services.infra.events.builders.order import build_order_edited_event
from Delivery_app_BK.services.infra.events.emiters.order import emit_order_events


def create_item(ctx: ServiceContext):
    relationship_map = {
        "order_id": Order,
        "item_state_id": ItemState,
        "item_position_id": ItemPosition,
        "team_id": Team
    }
    ctx.set_relationship_map(relationship_map)
    instances = []
    touched_orders: list[Order] = []

    for field_set in extract_fields(ctx):

        instance = create_instance(ctx, Item, dict(field_set))
        instances.append(instance)
        if instance.order is not None:
            touched_orders.append(instance.order)

    db.session.add_all(instances)
    touch_orders_items_updated_at(touched_orders)
    for order in _unique_orders(touched_orders):
        touch_route_freshness_by_order(order)
    db.session.flush()
    result = build_create_result(ctx, instances)
    db.session.commit()
    _emit_item_update_events(ctx, touched_orders)
    return {"item":result}


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
