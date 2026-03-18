"""
Routers for the client-form-link feature.

  Authenticated (admin):
    POST /api/v2/orders/<order_id>/client-form-link  → generate / regenerate token

  Public (no auth):
    GET  /api/v2/public/client-form/<token>           → fetch safe order data for the form
    POST /api/v2/public/client-form/<token>           → submit client info
"""

from flask import Blueprint, jsonify, request

# TODO: import jwt_required, get_jwt_identity, get_jwt_claims
# TODO: import service functions once implemented

client_form_bp = Blueprint("client_form", __name__)
public_client_form_bp = Blueprint("public_client_form", __name__)


# ── Authenticated ──────────────────────────────────────────────────────────────

@client_form_bp.route("/orders/<int:order_id>/client-form-link", methods=["POST"])
# @jwt_required()
def generate_client_form_link(order_id: int):
    """Generate (or regenerate) a secure client-form link for the given order."""
    # TODO: extract team_id from JWT claims
    # TODO: call generate_client_form_token(order_id, team_id)
    # TODO: return { form_url, expires_at }
    return jsonify({"TODO": "not implemented"}), 501


# ── Public ─────────────────────────────────────────────────────────────────────

@public_client_form_bp.route("/public/client-form/<string:token>", methods=["GET"])
def get_client_form(token: str):
    """Return the safe order data needed to render the public client form."""
    # TODO: call get_client_form_data(token)
    # TODO: handle TokenExpiredError / TokenInvalidError / TokenAlreadyUsedError
    return jsonify({"TODO": "not implemented"}), 501


@public_client_form_bp.route("/public/client-form/<string:token>", methods=["POST"])
def submit_client_form(token: str):
    """Accept and persist the client's submitted information."""
    payload = request.get_json(force=True) or {}
    # TODO: call submit_client_form(token, payload)
    # TODO: handle errors
    return jsonify({"TODO": "not implemented"}), 501
