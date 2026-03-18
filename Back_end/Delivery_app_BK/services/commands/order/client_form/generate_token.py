"""
TODO: Generate a secure client-form token for an order.

Responsibilities:
- Validate that the order belongs to the requesting team.
- Generate a cryptographically random token via secrets.token_urlsafe(32).
- Set client_form_token, client_form_token_expires_at (now + TTL hours).
- Clear client_form_submitted_at if regenerating.
- Persist and return the token.

Returns: { "token": str, "expires_at": datetime, "form_url": str }
"""

import secrets
from datetime import datetime, timedelta, timezone

# TODO: import db, Order model, config for TTL and BASE_URL


def generate_client_form_token(order_id: int, team_id: int, ttl_hours: int = 72):
    # TODO: implement
    raise NotImplementedError
