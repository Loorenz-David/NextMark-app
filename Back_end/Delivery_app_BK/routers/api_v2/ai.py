from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt

from Delivery_app_BK.routers.utils.role_decorator import role_required, ADMIN, ASSISTANT
from Delivery_app_BK.services.context import ServiceContext
from Delivery_app_BK.ai.orchestrator import handle_ai_request

ai_bp = Blueprint("api_v2_ai_bp", __name__)


@ai_bp.route("/command", methods=["POST"])
@jwt_required()
@role_required([ADMIN, ASSISTANT])
def ai_command():
    identity = get_jwt()
    data = request.get_json(silent=True) or {}
    user_input = data.get("input", "")
    parameters = data.get("parameters", {})

    ctx = ServiceContext(
        incoming_data=parameters,
        identity=identity,
    )

    response = handle_ai_request(ctx, user_input)

    return jsonify(response.model_dump())
