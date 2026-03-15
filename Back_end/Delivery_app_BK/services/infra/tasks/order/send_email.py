from __future__ import annotations

from datetime import datetime, timezone

from Delivery_app_BK.models import OrderEventAction, db
from Delivery_app_BK.services.domain.messaging import SCHEDULE_ANCHOR_FUTURE_BUSINESS_TIME
from Delivery_app_BK.services.infra.messaging import MessageRenderContext
from Delivery_app_BK.services.infra.messaging import resolve_email_template
from Delivery_app_BK.services.infra.messaging.action_scheduling import resolve_current_order_future_anchor
from Delivery_app_BK.services.infra.messaging.email_service import send_email_message


def _truncate_error(error_message: str) -> str:
    if len(error_message) <= 3000:
        return error_message
    return error_message[:3000]


def _mark_action_failed(action: OrderEventAction, error_message: str) -> None:
    action.status = OrderEventAction.STATUS_FAILED
    action.last_error = _truncate_error(error_message)
    db.session.commit()


def _mark_action_success(action: OrderEventAction) -> None:
    action.status = OrderEventAction.STATUS_SUCCESS
    action.last_error = None
    action.processed_at = datetime.now(timezone.utc)
    db.session.commit()


def _mark_action_skipped(action: OrderEventAction, reason: str) -> None:
    action.status = OrderEventAction.STATUS_SKIPPED
    action.last_error = _truncate_error(reason)
    action.processed_at = datetime.now(timezone.utc)
    db.session.commit()


# Synchronous for now. This can be wrapped by Celery workers later.
def send_email(action_id: int) -> None:
    action = db.session.get(OrderEventAction, action_id)
    if action is None:
        return
    if action.status in {OrderEventAction.STATUS_SUCCESS, OrderEventAction.STATUS_SKIPPED}:
        return
    if action.scheduled_for is not None and action.scheduled_for > datetime.now(timezone.utc):
        return

    action.attempts = (action.attempts or 0) + 1
    db.session.commit()

    try:
        if action.event is None or action.event.order is None:
            _mark_action_failed(action, "Order event context is missing")
            return

        team_id = action.team_id if action.team_id is not None else getattr(action.event, "team_id", None)
        if team_id is None:
            _mark_action_failed(action, "Missing team context for email send")
            return

        template = resolve_email_template(team_id=team_id, channel="email", event_name=action.event.event_name)
        if template is None or not bool(template.enable):
            _mark_action_skipped(action, "Email template is missing or disabled at execution time")
            return

        if action.schedule_anchor_type == SCHEDULE_ANCHOR_FUTURE_BUSINESS_TIME:
            current_anchor_at = resolve_current_order_future_anchor(action.event)
            if current_anchor_at is None:
                _mark_action_skipped(action, "Future business anchor is no longer available at execution time")
                return
            if action.schedule_anchor_at != current_anchor_at:
                _mark_action_skipped(action, "Future business anchor changed after the action was scheduled")
                return

        order = action.event.order
        recipient = (order.client_email or "").strip()
        if not recipient:
            _mark_action_failed(action, "Order has no client email")
            return

        render_context = MessageRenderContext(
            order=order,
            order_event=action.event,
            team_id=team_id,
        )

        send_email_message(
            team_id=team_id,
            recipient=recipient,
            event_name=action.event.event_name,
            render_context=render_context,
        )
        _mark_action_success(action)
    except Exception as exc:
        _mark_action_failed(action, str(exc))
