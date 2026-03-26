from Delivery_app_BK.services.commands.order.update_order_delivery_plan_batch import (
    update_orders_delivery_plan_batch,
)
from Delivery_app_BK.services.context import ServiceContext


def assign_orders_to_plan_batch(
    ctx: ServiceContext,
    plan_id: int,
) -> dict:
    return update_orders_delivery_plan_batch(ctx, plan_id)
