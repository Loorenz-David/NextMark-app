from __future__ import annotations

from Delivery_app_BK.models import AppEventOutbox, OrderEvent, db
from Delivery_app_BK.services.infra.jobs import with_app_context
from Delivery_app_BK.sockets.emitters.app_events import fanout_app_event
from Delivery_app_BK.sockets.emitters.order_events import fanout_order_event


@with_app_context
def relay_order_event_job(event_row_id: int) -> None:
    event_row = db.session.get(OrderEvent, event_row_id)
    if event_row is None:
        return
    fanout_order_event(event_row)


@with_app_context
def relay_app_event_job(event_row_id: int) -> None:
    event_row = db.session.get(AppEventOutbox, event_row_id)
    if event_row is None:
        return
    fanout_app_event(event_row)
