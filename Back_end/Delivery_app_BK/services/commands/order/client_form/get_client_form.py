"""
Fetch the order data exposed to the public client form.

Security:
- Incoming raw token is hashed (SHA-256) before DB lookup — hash never leaks.
- Returns only a safe subset of fields (no driver, plan, or state data).

Returns: { "reference_number": str, "items": [...], "team_name": str, "expires_at": str }
Raises: TokenInvalidError | TokenExpiredError | TokenAlreadyUsedError
"""

import hashlib
from datetime import datetime, timezone

# TODO: import db, Order, Team models
# TODO: define TokenInvalidError, TokenExpiredError, TokenAlreadyUsedError in errors/


def get_client_form_data(token: str) -> dict:
    token_hash = hashlib.sha256(token.encode("utf-8")).hexdigest()

    # TODO: order = Order.query.filter_by(client_form_token_hash=token_hash).first()
    # TODO: if not order: raise TokenInvalidError()
    # TODO: if datetime.now(timezone.utc) > order.client_form_token_expires_at: raise TokenExpiredError()
    # TODO: if order.client_form_submitted_at is not None: raise TokenAlreadyUsedError()

    # TODO: return safe payload:
    # {
    #     "reference_number": order.reference_number,
    #     "team_name": order.team.name,
    #     "items": [{"name": i.name, "quantity": i.quantity} for i in order.items],
    #     "expires_at": order.client_form_token_expires_at.isoformat(),
    # }
    raise NotImplementedError
