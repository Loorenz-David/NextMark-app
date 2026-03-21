from flask import Blueprint, request, jsonify, abort
from flask_jwt_extended import jwt_required, get_jwt

from Delivery_app_BK.routers.utils.role_decorator import role_required, ADMIN, ASSISTANT
from Delivery_app_BK.services.context import ServiceContext
from Delivery_app_BK.ai.errors import ThreadAccessError, ThreadNotFoundError
from Delivery_app_BK.ai.orchestrator import handle_ai_request_with_thread
from Delivery_app_BK.ai.response_formatter import format_response
from Delivery_app_BK.ai.prompts.system_prompt import build_system_prompt
from Delivery_app_BK.ai import thread_store
from Delivery_app_BK.ai.thread_store import (
    append_turn,
    assert_thread_access,
    build_assistant_turn,
    build_tool_turn,
    build_user_turn,
    create_thread,
    list_all_turns,
    list_turns,
)

ai_bp = Blueprint("api_v2_ai_bp", __name__)


# ---------------------------------------------------------------------------
# POST /threads — create a new conversation thread
# ---------------------------------------------------------------------------

@ai_bp.route("/threads", methods=["POST"])
@jwt_required()
@role_required([ADMIN, ASSISTANT])
def create_thread_route():
    identity = get_jwt()
    user_id = identity.get("user_id")
    app_scope = identity.get("app_scope", "admin")
    session_scope_id = identity.get("session_scope_id")

    data = request.get_json(silent=True) or {}
    current_workspace = (data.get("context") or {}).get("route")

    meta = create_thread(
        user_id=user_id,
        app_scope=app_scope,
        session_scope_id=session_scope_id,
        current_workspace=current_workspace,
    )

    return jsonify({"success": True, "data": {"thread_id": meta.thread_id}}), 201


# ---------------------------------------------------------------------------
# POST /threads/<thread_id>/messages — send a message to a thread
# ---------------------------------------------------------------------------

@ai_bp.route("/threads/<thread_id>/messages", methods=["POST"])
@jwt_required()
@role_required([ADMIN, ASSISTANT])
def send_message(thread_id: str):
    identity = get_jwt()
    user_id = identity.get("user_id")
    app_scope = identity.get("app_scope", "admin")
    session_scope_id = identity.get("session_scope_id")

    data = request.get_json(silent=True) or {}
    message = data.get("message", "").strip()

    if not message:
        return jsonify({"success": False, "error": "message is required"}), 400

    try:
        assert_thread_access(
            thread_id,
            user_id=user_id,
            app_scope=app_scope,
            session_scope_id=session_scope_id,
        )
    except ThreadNotFoundError:
        return jsonify({"success": False, "error": "Thread not found or expired"}), 404
    except ThreadAccessError:
        return jsonify({"success": False, "error": "Access denied"}), 403

    # Persist user turn
    user_turn = build_user_turn(thread_id, message)
    append_turn(thread_id, user_turn)

    # Load prior turns (capped) for planner history
    prior_turns = list_turns(thread_id)

    # Build service context for tool execution
    ctx = ServiceContext(
        incoming_data=data.get("context") or {},
        identity=identity,
    )

    # Run planner loop with fresh system prompt (state maps injected)
    system_prompt = build_system_prompt()
    result = handle_ai_request_with_thread(ctx, message, prior_turns, system_prompt=system_prompt)

    # Persist tool turns
    for tool_entry in result.tool_turns:
        tool_turn = build_tool_turn(
            thread_id,
            tool_entry["tool"],
            tool_entry["params"],
            tool_entry["result"],
        )
        append_turn(thread_id, tool_turn)

    # Format structured response
    response = format_response(
        thread_id,
        result.final_message,
        result.tool_turns,
        success=result.success,
        data=result.data,
    )

    # Persist assistant turn with same trace + actions
    assistant_turn = build_assistant_turn(
        thread_id,
        result.final_message,
        tool_trace=response.message.tool_trace,
        actions=response.message.actions,
        data=result.data,
        status_label=response.message.status_label,
    )
    append_turn(thread_id, assistant_turn)

    return jsonify({"success": True, "data": response.model_dump()}), 200


# ---------------------------------------------------------------------------
# GET /threads/<thread_id> — rehydrate thread
# ---------------------------------------------------------------------------

@ai_bp.route("/threads/<thread_id>", methods=["GET"])
@jwt_required()
@role_required([ADMIN, ASSISTANT])
def get_thread(thread_id: str):
    identity = get_jwt()
    user_id = identity.get("user_id")
    app_scope = identity.get("app_scope", "admin")
    session_scope_id = identity.get("session_scope_id")

    try:
        assert_thread_access(
            thread_id,
            user_id=user_id,
            app_scope=app_scope,
            session_scope_id=session_scope_id,
        )
    except ThreadNotFoundError:
        return jsonify({"success": False, "error": "Thread not found or expired"}), 404
    except ThreadAccessError:
        return jsonify({"success": False, "error": "Access denied"}), 403

    turns = list_all_turns(thread_id)
    visible_turns = [t for t in turns if t.role in ("user", "assistant")]

    return jsonify({
        "success": True,
        "data": {
            "thread_id": thread_id,
            "messages": [t.model_dump() for t in visible_turns],
        },
    }), 200


# ---------------------------------------------------------------------------
# POST /command — removed. Use POST /threads + POST /threads/<id>/messages.
# ---------------------------------------------------------------------------

