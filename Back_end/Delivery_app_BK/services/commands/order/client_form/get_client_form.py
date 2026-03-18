"""
TODO: Fetch the order data exposed to the public client form.

Responsibilities:
- Look up order by client_form_token.
- Validate token is not expired (client_form_token_expires_at > now).
- Validate token has not been used (client_form_submitted_at is None).
- Return safe subset of order fields (reference_number, items summary, team branding).
  — Do NOT return internal fields (driver, plan, state history, etc.)

Returns: { "reference_number": str, "items": [...], "team_name": str, ... }
Raises: TokenExpiredError | TokenInvalidError | TokenAlreadyUsedError
"""


def get_client_form_data(token: str):
    # TODO: implement
    raise NotImplementedError
