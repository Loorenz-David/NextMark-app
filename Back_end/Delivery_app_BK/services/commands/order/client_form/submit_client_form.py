"""
TODO: Accept and persist client-submitted info for an order.

Responsibilities:
- Look up order by client_form_token (same validation as get_client_form_data).
- Validate and sanitize incoming payload (only allow client_info fields):
    client_first_name, client_last_name, client_email,
    client_primary_phone, client_secondary_phone, client_address
- Write fields to the order row.
- Set client_form_submitted_at = now (invalidates the token).
- Optionally emit a Socket.IO event to notify the admin in real-time.

Returns: { "success": True }
Raises: TokenExpiredError | TokenInvalidError | TokenAlreadyUsedError | ValidationError
"""

ALLOWED_CLIENT_FIELDS = {
    "client_first_name",
    "client_last_name",
    "client_email",
    "client_primary_phone",
    "client_secondary_phone",
    "client_address",
}


def submit_client_form(token: str, payload: dict):
    # TODO: implement
    raise NotImplementedError
