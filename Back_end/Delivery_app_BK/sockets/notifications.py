from __future__ import annotations

from datetime import datetime, timezone
from hashlib import sha1

from flask import request
from sqlalchemy import func

from Delivery_app_BK.models import BaseRole, Order, RouteSolution, RouteSolutionStop, User, UserRole, db
from Delivery_app_BK.services.domain.user import ADMIN_APP_SCOPE, DRIVER_APP_SCOPE
from Delivery_app_BK.services.infra.redis import (
    add_unread_notification,
    get_unread_count,
    list_unread_notifications,
    mark_notifications_read,
)
from Delivery_app_BK.socketio_instance import socketio
from Delivery_app_BK.sockets.connection.auth import authenticated_socket_event, emit_socket_error
from Delivery_app_BK.sockets.contracts.realtime import (
    CLIENT_EVENT_NOTIFICATION_MARK_READ,
    SERVER_EVENT_NOTIFICATION_EVENT,
    SERVER_EVENT_NOTIFICATION_SNAPSHOT,
)
from Delivery_app_BK.sockets.rooms.names import build_user_app_room

ADMIN_NOTIFICATION_BASE_ROLES = {"admin", "assistant"}


def emit_notification_snapshot_for_claims(claims: dict) -> None:
    user_id = claims.get("user_id")
    app_scope = claims.get("app_scope")
    if not isinstance(user_id, int) or not isinstance(app_scope, str):
        return

    notifications = list_unread_notifications(user_id=user_id, app_scope=app_scope)
    socketio.emit(
        SERVER_EVENT_NOTIFICATION_SNAPSHOT,
        {
            "notifications": notifications,
            "unread_count": get_unread_count(user_id=user_id, app_scope=app_scope),
        },
        room=request.sid,
    )


@authenticated_socket_event
def handle_notification_mark_read(claims: dict, data: dict | None) -> None:
    user_id = claims.get("user_id")
    app_scope = claims.get("app_scope")
    if not isinstance(user_id, int) or not isinstance(app_scope, str):
        emit_socket_error(code="invalid_claims", error="Notification read requires a valid socket session.")
        return

    notification_ids = data.get("notification_ids") if isinstance(data, dict) else None
    if not isinstance(notification_ids, list):
        emit_socket_error(code="invalid_notification_ids", error="notification_ids must be a list.")
        return

    mark_notifications_read(
        user_id=user_id,
        app_scope=app_scope,
        notification_ids=[str(notification_id) for notification_id in notification_ids],
    )
    socketio.emit(
        SERVER_EVENT_NOTIFICATION_SNAPSHOT,
        {
            "notifications": list_unread_notifications(user_id=user_id, app_scope=app_scope),
            "unread_count": get_unread_count(user_id=user_id, app_scope=app_scope),
        },
        room=build_user_app_room(user_id, app_scope),
    )


def notify_order_event(*, event_id: str, event_name: str, team_id: int | None, order_id: int | None, payload: dict | None, occurred_at, actor: User | None) -> None:
    if team_id is None or order_id is None:
        return

    order = db.session.get(Order, order_id)
    if order is None:
        return

    recipients = [
        *(resolve_admin_notification_recipients(team_id=team_id, actor_user_id=actor.id if actor else None)),
        *(resolve_driver_notification_recipients(team_id=team_id, order_id=order_id, actor_user_id=actor.id if actor else None)),
    ]
    occurred_iso = _to_iso_string(occurred_at)

    for recipient in recipients:
        target = _build_notification_target(
            app_scope=recipient["app_scope"],
            event_name=event_name,
            order=order,
            payload=payload or {},
            route_id=recipient.get("route_id"),
        )
        if target is None:
            continue

        notification = build_notification_item(
            event_id=event_id,
            recipient_user_id=recipient["user_id"],
            app_scope=recipient["app_scope"],
            kind=event_name,
            entity_type="order",
            entity_id=order_id,
            team_id=team_id,
            actor=actor,
            title=_build_notification_title(event_name),
            description=_build_notification_description(
                event_name=event_name,
                order=order,
                payload=payload or {},
            ),
            occurred_at=occurred_iso,
            target=target,
            related_ids={"order_id": order_id},
        )
        _store_and_emit_notification(recipient["user_id"], recipient["app_scope"], notification)


def notify_app_event(*, event_id: str, event_name: str, team_id: int | None, entity_type: str, entity_id: int | None, payload: dict | None, occurred_at, actor: User | None) -> None:
    if team_id is None:
        return

    payload = payload or {}
    order_id = _parse_int(payload.get("order_id"))
    order_case_id = _parse_int(payload.get("order_case_id"))
    order = db.session.get(Order, order_id) if order_id is not None else None
    if event_name == "order_chat.message_created" and order is None:
        return

    recipients = [
        *(resolve_admin_notification_recipients(team_id=team_id, actor_user_id=actor.id if actor else None)),
        *(resolve_driver_notification_recipients(team_id=team_id, order_id=order_id, actor_user_id=actor.id if actor else None)),
    ]
    occurred_iso = _to_iso_string(occurred_at)

    for recipient in recipients:
        target = _build_notification_target(
            app_scope=recipient["app_scope"],
            event_name=event_name,
            order=order,
            payload=payload,
            route_id=recipient.get("route_id"),
        )
        if target is None:
            continue

        notification = build_notification_item(
            event_id=event_id,
            recipient_user_id=recipient["user_id"],
            app_scope=recipient["app_scope"],
            kind=event_name,
            entity_type=entity_type,
            entity_id=entity_id,
            team_id=team_id,
            actor=actor,
            title=_build_notification_title(event_name),
            description=_build_notification_description(
                event_name=event_name,
                order=order,
                payload=payload,
            ),
            occurred_at=occurred_iso,
            target=target,
            related_ids={
                "order_id": order_id,
                "order_case_id": order_case_id,
            },
        )
        _store_and_emit_notification(recipient["user_id"], recipient["app_scope"], notification)


def resolve_admin_notification_recipients(*, team_id: int, actor_user_id: int | None) -> list[dict]:
    rows = (
        db.session.query(User.id)
        .join(UserRole, User.user_role_id == UserRole.id)
        .join(BaseRole, UserRole.base_role_id == BaseRole.id)
        .filter(
            User.team_id == team_id,
            func.lower(BaseRole.role_name).in_(tuple(ADMIN_NOTIFICATION_BASE_ROLES)),
        )
        .distinct()
        .all()
    )
    return [
        {"user_id": int(user_id), "app_scope": ADMIN_APP_SCOPE}
        for (user_id,) in rows
        if isinstance(user_id, int) and user_id != actor_user_id
    ]


def resolve_driver_notification_recipients(*, team_id: int, order_id: int | None, actor_user_id: int | None) -> list[dict]:
    if order_id is None:
        return []

    rows = (
        db.session.query(RouteSolution.driver_id, RouteSolution.id)
        .join(RouteSolutionStop, RouteSolutionStop.route_solution_id == RouteSolution.id)
        .filter(
            RouteSolution.team_id == team_id,
            RouteSolutionStop.team_id == team_id,
            RouteSolutionStop.order_id == order_id,
            RouteSolution.is_selected.is_(True),
            RouteSolution.driver_id.isnot(None),
        )
        .distinct()
        .all()
    )

    recipients: list[dict] = []
    seen: set[tuple[int, int]] = set()
    for driver_id, route_id in rows:
        if not isinstance(driver_id, int) or driver_id == actor_user_id:
            continue
        if not isinstance(route_id, int):
            continue
        key = (driver_id, route_id)
        if key in seen:
            continue
        seen.add(key)
        recipients.append({
            "user_id": driver_id,
            "app_scope": DRIVER_APP_SCOPE,
            "route_id": route_id,
        })

    return recipients


def build_notification_item(
    *,
    event_id: str,
    recipient_user_id: int,
    app_scope: str,
    kind: str,
    entity_type: str,
    entity_id: int | None,
    team_id: int | None,
    actor: User | None,
    title: str,
    description: str,
    occurred_at: str,
    target: dict,
    related_ids: dict | None = None,
) -> dict:
    notification_id = _build_notification_id(event_id=event_id, recipient_user_id=recipient_user_id, app_scope=app_scope)
    payload = {
        "notification_id": notification_id,
        "event_id": event_id,
        "kind": kind,
        "entity_type": entity_type,
        "entity_id": entity_id,
        "team_id": team_id,
        "actor_user_id": actor.id if actor and isinstance(actor.id, int) else None,
        "actor_username": _resolve_actor_username(actor),
        "title": title,
        "description": description,
        "occurred_at": occurred_at,
        "target": target,
        "read": False,
    }
    if related_ids:
        payload.update({key: value for key, value in related_ids.items() if value is not None})
    return payload


def _store_and_emit_notification(user_id: int, app_scope: str, notification: dict) -> None:
    add_unread_notification(user_id=user_id, app_scope=app_scope, notification=notification)
    socketio.emit(
        SERVER_EVENT_NOTIFICATION_EVENT,
        notification,
        room=build_user_app_room(user_id, app_scope),
    )
    socketio.emit(
        SERVER_EVENT_NOTIFICATION_SNAPSHOT,
        {
            "notifications": list_unread_notifications(user_id=user_id, app_scope=app_scope),
            "unread_count": get_unread_count(user_id=user_id, app_scope=app_scope),
        },
        room=build_user_app_room(user_id, app_scope),
    )


def _build_notification_id(*, event_id: str, recipient_user_id: int, app_scope: str) -> str:
    return sha1(f"{event_id}:{recipient_user_id}:{app_scope}".encode("utf-8")).hexdigest()


def _build_notification_title(event_name: str) -> str:
    mapping = {
        "order.created": "Order created",
        "order.updated": "Order updated",
        "order.state_changed": "Order state changed",
        "order_case.created": "New order case",
        "order_case.updated": "Order case updated",
        "order_case.state_changed": "Order case state changed",
        "order_chat.message_created": "New case message",
    }
    return mapping.get(event_name, "New update")


def _build_notification_description(*, event_name: str, order: Order | None, payload: dict) -> str:
    reference = order.reference_number if order and order.reference_number else None
    order_label = f"Order #{reference}" if reference else (f"Order #{order.id}" if order and isinstance(order.id, int) else "Order")
    if event_name == "order.created":
        return f"{order_label} was created."
    if event_name == "order.updated":
        return f"{order_label} was updated."
    if event_name == "order.state_changed":
        return f"{order_label} changed state."
    if event_name == "order_case.created":
        return f"A new case was created for {order_label}."
    if event_name == "order_case.updated":
        return f"A case for {order_label} was updated."
    if event_name == "order_case.state_changed":
        state = payload.get("state")
        if isinstance(state, str) and state.strip():
            return f"A case for {order_label} changed to {state.strip()}."
        return f"A case for {order_label} changed state."
    if event_name == "order_chat.message_created":
        message = str(payload.get("message") or "").strip()
        if message:
            return message[:140]
        return f"There is a new message for {order_label}."
    return "A new update is available."


def _build_notification_target(*, app_scope: str, event_name: str, order: Order | None, payload: dict, route_id: int | None) -> dict | None:
    order_id = order.id if order and isinstance(order.id, int) else _parse_int(payload.get("order_id"))
    order_case_id = _parse_int(payload.get("order_case_id"))

    if app_scope == DRIVER_APP_SCOPE:
        if route_id is None:
            return None
        params = {"routeId": route_id}
        if order_id is not None:
            params["orderId"] = order_id
        if order_case_id is not None:
            params["orderCaseId"] = order_case_id
        return {
            "kind": "route_execution",
            "route": "/",
            "params": params,
        }

    if event_name in {"order.created", "order.updated", "order.state_changed"} and order_id is not None:
        return {
            "kind": "order_detail",
            "route": "/",
            "params": {"orderId": order_id},
        }

    if event_name in {"order_case.created", "order_case.updated", "order_case.state_changed"} and order_case_id is not None:
        return {
            "kind": "order_case_detail",
            "route": "/",
            "params": {
                "orderId": order_id,
                "orderCaseId": order_case_id,
                "orderCaseClientId": payload.get("order_case_client_id"),
            },
        }

    if event_name == "order_chat.message_created" and order_case_id is not None:
        return {
            "kind": "order_case_chat",
            "route": "/",
            "params": {
                "orderId": order_id,
                "orderCaseId": order_case_id,
            },
        }

    return None


def _parse_int(value: object) -> int | None:
    if isinstance(value, int):
        return value
    if isinstance(value, str) and value.isdigit():
        return int(value)
    return None


def _resolve_actor_username(actor: User | None) -> str | None:
    if actor is None:
        return None
    username = getattr(actor, "username", None)
    if isinstance(username, str) and username.strip():
        return username.strip()
    email = getattr(actor, "email", None)
    if isinstance(email, str) and email.strip():
        return email.strip()
    return None


def _to_iso_string(value: object) -> str:
    if isinstance(value, datetime):
        if value.tzinfo is None:
            value = value.replace(tzinfo=timezone.utc)
        return value.isoformat()
    if isinstance(value, str) and value.strip():
        return value
    return datetime.now(timezone.utc).isoformat()
