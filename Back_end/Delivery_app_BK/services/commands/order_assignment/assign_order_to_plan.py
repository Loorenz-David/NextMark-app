from Delivery_app_BK.services.commands.order.update_order_delivery_plan import (
    update_order_delivery_plan,
)
from Delivery_app_BK.services.context import ServiceContext


def assign_order_to_plan(
    ctx: ServiceContext,
    order_id: int,
    plan_id: int,
) -> dict:
    return update_order_delivery_plan(ctx, order_id, plan_id)
