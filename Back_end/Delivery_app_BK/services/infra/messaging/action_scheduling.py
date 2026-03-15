from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime, timedelta, timezone

from Delivery_app_BK.models import MessageTemplate, db
from Delivery_app_BK.services.domain.messaging import (
    SCHEDULE_ANCHOR_FUTURE_BUSINESS_TIME,
    SCHEDULE_ANCHOR_OCCURRED_AT,
    event_supports_future_anchor,
)


@dataclass(frozen=True)
class ResolvedActionSchedule:
    template_id: int
    scheduled_for: datetime | None
    schedule_anchor_type: str | None
    schedule_anchor_at: datetime | None
    skip_reason: str | None = None


def resolve_enabled_template(*, team_id: int | None, channel: str, event_name: str) -> MessageTemplate | None:
    if team_id is None:
        return None

    return (
        db.session.query(MessageTemplate)
        .filter(
            MessageTemplate.team_id == team_id,
            MessageTemplate.channel == channel,
            MessageTemplate.event == event_name,
            MessageTemplate.enable.is_(True),
        )
        .first()
    )


def resolve_order_action_schedule(order_event, action_name: str) -> ResolvedActionSchedule | None:
    channel = _resolve_channel(action_name)
    template = resolve_enabled_template(
        team_id=getattr(order_event, "team_id", None),
        channel=channel,
        event_name=order_event.event_name,
    )
    if template is None:
        return None

    anchor_type, anchor_at, skip_reason = _resolve_order_anchor(order_event)
    if skip_reason:
        return ResolvedActionSchedule(
            template_id=template.id,
            scheduled_for=None,
            schedule_anchor_type=anchor_type,
            schedule_anchor_at=anchor_at,
            skip_reason=skip_reason,
        )

    scheduled_for = _compute_scheduled_for(template=template, anchor_at=anchor_at)
    return ResolvedActionSchedule(
        template_id=template.id,
        scheduled_for=scheduled_for,
        schedule_anchor_type=anchor_type,
        schedule_anchor_at=anchor_at,
    )


def resolve_delivery_plan_action_schedule(plan_event, action_name: str) -> ResolvedActionSchedule | None:
    channel = _resolve_channel(action_name)
    template = resolve_enabled_template(
        team_id=getattr(plan_event, "team_id", None),
        channel=channel,
        event_name=plan_event.event_name,
    )
    if template is None:
        return None

    anchor_type, anchor_at, skip_reason = _resolve_delivery_plan_anchor(plan_event)
    if skip_reason:
        return ResolvedActionSchedule(
            template_id=template.id,
            scheduled_for=None,
            schedule_anchor_type=anchor_type,
            schedule_anchor_at=anchor_at,
            skip_reason=skip_reason,
        )

    scheduled_for = _compute_scheduled_for(template=template, anchor_at=anchor_at)
    return ResolvedActionSchedule(
        template_id=template.id,
        scheduled_for=scheduled_for,
        schedule_anchor_type=anchor_type,
        schedule_anchor_at=anchor_at,
    )


def resolve_current_order_future_anchor(order_event) -> datetime | None:
    order = getattr(order_event, "order", None)
    if order is None:
        return None

    baseline = getattr(order_event, "occurred_at", None) or datetime.now(timezone.utc)
    return _resolve_order_future_anchor(order, baseline)


def resolve_current_delivery_plan_future_anchor(plan_event) -> datetime | None:
    delivery_plan = getattr(plan_event, "delivery_plan", None) or getattr(plan_event, "plan", None)
    if delivery_plan is None:
        return None

    baseline = getattr(plan_event, "occurred_at", None) or datetime.now(timezone.utc)
    return _resolve_delivery_plan_future_anchor(delivery_plan, baseline)


def _resolve_channel(action_name: str) -> str:
    if action_name.endswith("_sms"):
        return "sms"
    if action_name.endswith("_email"):
        return "email"
    raise ValueError(f"Unsupported action channel for '{action_name}'.")


def _compute_scheduled_for(*, template: MessageTemplate, anchor_at: datetime) -> datetime:
    offset_value = int(template.schedule_offset_value or 0)
    offset_unit = template.schedule_offset_unit or "minutes"
    if offset_value == 0:
        return anchor_at

    if offset_unit == "minutes":
        delta = timedelta(minutes=offset_value)
    elif offset_unit == "hours":
        delta = timedelta(hours=offset_value)
    elif offset_unit == "days":
        delta = timedelta(days=offset_value)
    else:
        raise ValueError(f"Unsupported schedule offset unit '{offset_unit}'.")

    return anchor_at + delta


def _resolve_order_anchor(order_event) -> tuple[str | None, datetime | None, str | None]:
    occurred_at = getattr(order_event, "occurred_at", None) or datetime.now(timezone.utc)
    if not event_supports_future_anchor(getattr(order_event, "event_name", None)):
        return SCHEDULE_ANCHOR_OCCURRED_AT, occurred_at, None

    order = getattr(order_event, "order", None)
    if order is None:
        return (
            SCHEDULE_ANCHOR_FUTURE_BUSINESS_TIME,
            None,
            "Future business anchor could not be resolved because the order context is missing.",
        )

    anchor_at = _resolve_order_future_anchor(order, occurred_at)
    if anchor_at is None:
        return (
            SCHEDULE_ANCHOR_FUTURE_BUSINESS_TIME,
            None,
            "Future business anchor could not be resolved for the order event.",
        )

    return SCHEDULE_ANCHOR_FUTURE_BUSINESS_TIME, anchor_at, None


def _resolve_delivery_plan_anchor(plan_event) -> tuple[str | None, datetime | None, str | None]:
    occurred_at = getattr(plan_event, "occurred_at", None) or datetime.now(timezone.utc)
    if not event_supports_future_anchor(getattr(plan_event, "event_name", None)):
        return SCHEDULE_ANCHOR_OCCURRED_AT, occurred_at, None

    delivery_plan = getattr(plan_event, "delivery_plan", None) or getattr(plan_event, "plan", None)
    if delivery_plan is None:
        return (
            SCHEDULE_ANCHOR_FUTURE_BUSINESS_TIME,
            None,
            "Future business anchor could not be resolved because the delivery plan context is missing.",
        )

    anchor_at = _resolve_delivery_plan_future_anchor(delivery_plan, occurred_at)
    if anchor_at is None:
        return (
            SCHEDULE_ANCHOR_FUTURE_BUSINESS_TIME,
            None,
            "Future business anchor could not be resolved for the delivery plan event.",
        )

    return SCHEDULE_ANCHOR_FUTURE_BUSINESS_TIME, anchor_at, None


def _resolve_order_future_anchor(order, baseline: datetime) -> datetime | None:
    candidate_windows = []
    for window in list(getattr(order, "delivery_windows", None) or []):
        start_at = getattr(window, "start_at", None)
        if start_at is not None and start_at > baseline:
            candidate_windows.append(start_at)

    if candidate_windows:
        return min(candidate_windows)

    delivery_plan = getattr(order, "delivery_plan", None)
    if delivery_plan is not None:
        start_date = getattr(delivery_plan, "start_date", None)
        if start_date is not None and start_date > baseline:
            return start_date

    earliest_delivery_date = getattr(order, "earliest_delivery_date", None)
    if earliest_delivery_date is not None and earliest_delivery_date > baseline:
        return earliest_delivery_date

    return None


def _resolve_delivery_plan_future_anchor(delivery_plan, baseline: datetime) -> datetime | None:
    local_delivery = getattr(delivery_plan, "local_delivery", None)
    route_solutions = list(getattr(local_delivery, "route_solutions", None) or []) if local_delivery else []
    selected_route = next((route for route in route_solutions if getattr(route, "is_selected", False)), None)
    if selected_route is not None:
        expected_start_time = getattr(selected_route, "expected_start_time", None)
        if expected_start_time is not None and expected_start_time > baseline:
            return expected_start_time

    start_date = getattr(delivery_plan, "start_date", None)
    if start_date is not None and start_date > baseline:
        return start_date

    return None
