"""
Generate a secure client-form token for an order.

Security model:
- A cryptographically random raw token is generated with secrets.token_urlsafe(32).
- Only the SHA-256 hash is stored in the DB (client_form_token_hash).
- The raw token is returned once and embedded in the public form URL — never stored.
- Regenerating clears client_form_submitted_at so the new token is single-use.

Returns: { "raw_token": str, "expires_at": datetime }
  Caller builds the full URL as: f"{BASE_URL}/form/{raw_token}"
"""

import hashlib
import secrets
from datetime import datetime, timedelta, timezone

from Delivery_app_BK.models import db, Order
from Delivery_app_BK.errors import NotFound


DEFAULT_TTL_HOURS = 72


def generate_client_form_token(order_id: int, team_id: int, ttl_hours: int = DEFAULT_TTL_HOURS) -> dict:
    order: Order | None = (
        db.session.query(Order)
        .filter(Order.id == order_id, Order.team_id == team_id)
        .first()
    )

    if order is None:
        raise NotFound(f"Order {order_id} not found.")

    raw_token = secrets.token_urlsafe(32)
    token_hash = hashlib.sha256(raw_token.encode("utf-8")).hexdigest()
    expires_at = datetime.now(timezone.utc) + timedelta(hours=ttl_hours)

    order.client_form_token_hash = token_hash
    order.client_form_token_expires_at = expires_at
    order.client_form_submitted_at = None   # reset previous submission on regenerate

    db.session.commit()

    return {"raw_token": raw_token, "expires_at": order.client_form_token_expires_at}
