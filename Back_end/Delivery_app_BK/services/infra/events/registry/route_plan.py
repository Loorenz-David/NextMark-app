from Delivery_app_BK.services.domain.route_operations.plan.plan_events import DeliveryPlanEvent
from Delivery_app_BK.services.infra.events.event_bus import EventBus
from Delivery_app_BK.services.infra.events.handlers.route_plan.route_plan_email import (
    send_email_on_route_plan_rescheduled,
)
from Delivery_app_BK.services.infra.events.handlers.route_plan.route_plan_sms import (
    send_sms_on_route_plan_rescheduled,
)


def register_route_plan_event_handlers(event_bus: EventBus) -> None:
    event_bus.register(
        DeliveryPlanEvent.DELIVERY_PLAN_RESCHEDULED.value,
        send_sms_on_route_plan_rescheduled,
    )
    event_bus.register(
        DeliveryPlanEvent.DELIVERY_PLAN_RESCHEDULED.value,
        send_email_on_route_plan_rescheduled,
    )


register_delivery_plan_event_handlers = register_route_plan_event_handlers
