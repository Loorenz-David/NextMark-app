"""Recompute denormalized totals on a DeliveryPlan from its orders. Does NOT commit."""
from __future__ import annotations

import logging
from typing import TYPE_CHECKING

from sqlalchemy import func

from Delivery_app_BK.models import db, Order

if TYPE_CHECKING:
    from Delivery_app_BK.models.tables.delivery_plan.delivery_plan import DeliveryPlan

logger = logging.getLogger(__name__)


def recompute_plan_totals(plan: "DeliveryPlan") -> None:
    """Aggregate Order denormalized totals into plan columns. No commit issued."""
    if plan is None or plan.id is None:
        return

    result = db.session.query(
        func.sum(Order.total_weight_g),
        func.sum(Order.total_volume_cm3),
        func.sum(Order.total_item_count),
        func.count(Order.id),
    ).filter(Order.delivery_plan_id == plan.id).one()

    plan.total_weight_g   = float(result[0] or 0)
    plan.total_volume_cm3 = float(result[1] or 0)
    plan.total_item_count = int(result[2] or 0)
    plan.total_orders     = int(result[3] or 0)

    logger.debug(
        "recompute_plan_totals plan_id=%s weight=%s volume=%s items=%s orders=%s",
        plan.id,
        plan.total_weight_g,
        plan.total_volume_cm3,
        plan.total_item_count,
        plan.total_orders,
    )
