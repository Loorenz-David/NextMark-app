"""
Routers for the client-form-link feature.

  Authenticated (admin):
    POST /api/v2/orders/<order_id>/client-form-link  → generate / regenerate token

  Public (no auth — token acts as the credential):
    GET  /api/v2/public/client-form/<token>           → fetch safe order data for the form
    POST /api/v2/public/client-form/<token>           → submit client info (invalidates token)
"""

from flask import Blueprint, jsonify, request

# TODO: from flask_jwt_extended import jwt_required, get_jwt
# TODO: from Delivery_app_BK.services.commands.order.client_form.generate_token import generate_client_form_token
# TODO: from Delivery_app_BK.services.commands.order.client_form.get_client_form import get_client_form_data
# TODO: from Delivery_app_BK.services.commands.order.client_form.submit_client_form import submit_client_form
# TODO: import os  (for CLIENT_FORM_BASE_URL)

client_form_bp = Blueprint("client_form", __name__)
public_client_form_bp = Blueprint("public_client_form", __name__)

CLIENT_FORM_BASE_URL = "https://forms.nextmark.app"  # TODO: read from env


# ── Authenticated ──────────────────────────────────────────────────────────────

@client_form_bp.route("/orders/<int:order_id>/client-form-link", methods=["POST"])
# @jwt_required()
def generate_client_form_link(order_id: int):
    """Generate (or regenerate) a secure client-form link for the given order."""
    # TODO: claims = get_jwt(); team_id = claims.get("active_team_id")
    # TODO: result = generate_client_form_token(order_id, team_id)
    # TODO: form_url = f"{CLIENT_FORM_BASE_URL}/form/{result['raw_token']}"
    # TODO: return jsonify({"form_url": form_url, "expires_at": result["expires_at"].isoformat()})
    return jsonify({"TODO": "not implemented"}), 501


# ── Public ─────────────────────────────────────────────────────────────────────

@public_client_form_bp.route("/public/client-form/<string:token>", methods=["GET"])
def get_client_form(token: str):
    """Return the safe order data needed to render the public client form."""
    # TODO: handle TokenExpiredError → 410, TokenAlreadyUsedError → 409, TokenInvalidError → 404
    # TODO: data = get_client_form_data(token); return jsonify(data)
    return jsonify({"TODO": "not implemented"}), 501


@public_client_form_bp.route("/public/client-form/<string:token>", methods=["POST"])
def submit_client_form_route(token: str):
    """Accept and persist the client's submitted information."""
    payload = request.get_json(force=True) or {}
    # TODO: handle errors → 410 expired, 409 already used, 404 invalid, 422 validation
    # TODO: submit_client_form(token, payload); return jsonify({"success": True})
    return jsonify({"TODO": "not implemented"}), 501
