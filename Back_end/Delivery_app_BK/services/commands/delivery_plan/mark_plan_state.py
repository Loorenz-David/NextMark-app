from Delivery_app_BK.models import RoutePlan
from ...context import ServiceContext
from Delivery_app_BK.services.commands.order.order_states.update_orders_state import update_orders_state
from Delivery_app_BK.services.domain.delivery_plan.plan.plan_states import PlanStateId
from ...domain.order.order_states import OrderStateId
from Delivery_app_BK.services.queries.get_instance import get_instance
from Delivery_app_BK.services.domain.state_transitions.plan_state_engine import apply_plan_state


def mark_plan_state(
        ctx: ServiceContext,
        delivery_plan_id: int,
        state_id: PlanStateId
):
        plan: RoutePlan = get_instance(ctx, RoutePlan, delivery_plan_id)

        if not apply_plan_state(plan, state_id):
                return {}

        if state_id == PlanStateId.READY:
                _TERMINAL_ORDER_STATE_IDS = {OrderStateId.COMPLETED, OrderStateId.CANCELLED}
                eligible_orders = [
                        o for o in (plan.orders or [])
                        if o.order_state_id not in _TERMINAL_ORDER_STATE_IDS
                ]
                update_orders_state(
                        ctx=ctx,
                        orders=eligible_orders,
                        state_id=OrderStateId.READY,
                )

        return {
                "failed_order_state_updates": {}
        }
