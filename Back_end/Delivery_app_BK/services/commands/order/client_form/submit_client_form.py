"""
Accept and persist the client-submitted info for an order.

Security:
- Token is hashed before lookup — raw token is never stored.
- Payload is strictly filtered to ALLOWED_CLIENT_FIELDS; any other keys are silently dropped.
- Token is invalidated immediately on successful write (single-use).

Side effects:
- Emits SERVER_EVENT_CLIENT_FORM_SUBMITTED to the team admin room so the admin
  receives a real-time notification without polling.

Returns: { "success": True }
Raises: TokenInvalidError | TokenExpiredError | TokenAlreadyUsedError | ValidationError
"""

import hashlib
from datetime import datetime, timezone

# TODO: import db, Order model
# TODO: from Delivery_app_BK.socketio_instance import socketio
# TODO: from Delivery_app_BK.sockets.contracts.realtime import SERVER_EVENT_CLIENT_FORM_SUBMITTED
# TODO: from Delivery_app_BK.sockets.rooms.names import build_team_admin_room

ALLOWED_CLIENT_FIELDS = {
    "client_first_name",
    "client_last_name",
    "client_email",
    "client_primary_phone",
    "client_secondary_phone",
    "client_address",
}


def submit_client_form(token: str, payload: dict) -> dict:
    token_hash = hashlib.sha256(token.encode("utf-8")).hexdigest()

    # TODO: order = Order.query.filter_by(client_form_token_hash=token_hash).first()
    # TODO: validate token (same checks as get_client_form_data)

    # Sanitize — only write allowed fields
    safe_payload = {k: v for k, v in payload.items() if k in ALLOWED_CLIENT_FIELDS}

    # TODO: apply safe_payload fields to order
    # TODO: order.client_form_submitted_at = datetime.now(timezone.utc)
    # TODO: db.session.commit()

    # Real-time notification to all admins of this team
    # TODO: socketio.emit(
    #     SERVER_EVENT_CLIENT_FORM_SUBMITTED,
    #     {
    #         "order_id": order.id,
    #         "order_reference": order.reference_number,
    #     },
    #     room=build_team_admin_room(order.team_id),
    # )

    return {"success": True}
