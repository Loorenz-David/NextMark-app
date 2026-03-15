from datetime import datetime, timezone
from uuid import uuid4

from Delivery_app_BK.services.domain.user import ADMIN_APP_SCOPE, DRIVER_APP_SCOPE
from Delivery_app_BK.socketio_instance import socketio
from Delivery_app_BK.sockets.contracts.realtime import (
    DEFAULT_EVENT_VERSION,
    SERVER_EVENT_REALTIME_EVENT,
)


def build_business_event_envelope(
    *,
    event_name: str,
    team_id: int | None,
    entity_type: str,
    entity_id: int | None,
    payload: dict | None,
    event_id: str | None = None,
    occurred_at: datetime | None = None,
    app_scopes: list[str] | None = None,
) -> dict:
    resolved_occurred_at = occurred_at or datetime.now(timezone.utc)

    return {
        "event_id": event_id or str(uuid4()),
        "event_name": event_name,
        "version": DEFAULT_EVENT_VERSION,
        "occurred_at": resolved_occurred_at.isoformat(),
        "team_id": team_id,
        "entity_type": entity_type,
        "entity_id": entity_id,
        "app_scopes": app_scopes or [ADMIN_APP_SCOPE, DRIVER_APP_SCOPE],
        "payload": payload or {},
    }


def emit_business_event(*, room: str, envelope: dict) -> None:
    socketio.emit(SERVER_EVENT_REALTIME_EVENT, envelope, room=room)
