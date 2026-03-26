import json
import logging
import re

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
from Delivery_app_BK.ai.capabilities.statistics import NarrativeStatisticalOutput
from Delivery_app_BK.ai.capabilities.registry import CAPABILITY_REGISTRY
from Delivery_app_BK.ai.providers.openai_provider import OpenAIProvider
from Delivery_app_BK.ai.schemas import AIInteraction, AIInteractionOption

logger = logging.getLogger(__name__)

ai_bp = Blueprint("api_v2_ai_bp", __name__)

_READONLY_CAPABILITIES = {"analytics", "statistics"}

_TOOL_TO_CAPABILITY: dict[str, str] = {
    "list_orders": "logistics",
    "list_plans": "logistics",
    "create_plan": "logistics",
    "list_routes": "logistics",
    "update_order_state": "logistics",
    "create_order": "logistics",
    "optimize_plan": "logistics",
    "assign_orders_to_plan": "logistics",
    "get_analytics_snapshot": "analytics",
    "get_daily_summary": "analytics",
    "get_route_metrics_tool": "analytics",
    "list_item_types_config": "user_config",
    "create_item_taxonomy_proposal": "user_config",
}

_OPERATION_TO_TOOL_ALLOWLIST: dict[str, list[str]] = {
    "list_orders": ["list_orders"],
    "list_plans": ["list_plans"],
    "create_plan": ["create_plan"],
    "list_routes": ["list_routes"],
    "update_order_state": ["update_order_state"],
    "item_taxonomy_config": ["list_item_types_config", "create_item_taxonomy_proposal"],
    "create_order": ["create_order"],
    "analyze_metrics": ["get_analytics_snapshot"],
}

_ANALYTICS_HINT_WORDS = {
    "analytics",
    "analysis",
    "metric",
    "metrics",
    "performance",
    "trend",
    "trends",
    "kpi",
    "why",
    "late",
    "failure",
    "fail",
}

_ACTION_HINT_WORDS = {
    "create",
    "update",
    "assign",
    "reschedule",
    "cancel",
    "optimize",
}


def _message_capability_hint(message: str) -> str | None:
    lowered = (message or "").lower()
    if any(word in lowered for word in _ANALYTICS_HINT_WORDS):
        return "analytics"
    if "item taxonomy" in lowered or "taxonomy" in lowered:
        return "user_config"
    return None


def _has_mixed_capability_intent(message: str) -> bool:
    lowered = (message or "").lower()
    has_analytics = _message_capability_hint(lowered) == "analytics"
    has_action = any(word in lowered for word in _ACTION_HINT_WORDS)
    return has_analytics and has_action


def _resolve_capability_auto(message: str, prior_turns: list) -> tuple[str | None, str, list[str]]:
    if _has_mixed_capability_intent(message):
        return None, "mixed", ["mixed_intent_needs_clarification"]

    hint = _message_capability_hint(message)
    if hint:
        return hint, "keyword_hint", []

    lowered = (message or "").strip().lower()
    short_followup = len(lowered.split()) <= 4 and any(
        lowered.startswith(prefix)
        for prefix in ("also", "and", "for", "what about", "same for")
    )
    if short_followup:
        for turn in reversed(prior_turns or []):
            data = getattr(turn, "data", None) or {}
            sticky = data.get("resolved_capability_id")
            if sticky in CAPABILITY_REGISTRY:
                return sticky, "sticky_followup", ["capability_auto_sticky_applied"]

    return "logistics", "default", []


def _build_mixed_intent_interaction(message: str) -> AIInteraction:
    _ = message
    return AIInteraction(
        id="int_clarify_capability_target",
        kind="single_select",
        label="Your request mixes analysis and actions. Which should I do first?",
        response_mode="options",
        options=[
            AIInteractionOption(id="analytics", label="Analytics", description="Read-only analysis"),
            AIInteractionOption(id="logistics", label="Logistics", description="Operational changes"),
        ],
    )


def _parse_capability_router_output(raw: str) -> dict | None:
    try:
        payload = json.loads(raw)
    except (TypeError, json.JSONDecodeError):
        return None
    if not isinstance(payload, dict):
        return None

    known = set(CAPABILITY_REGISTRY.keys())
    capability_ids = [c for c in (payload.get("capability_ids") or []) if c in known]
    ordered_capability_ids = [c for c in (payload.get("ordered_capability_ids") or []) if c in known]
    if not ordered_capability_ids:
        ordered_capability_ids = capability_ids

    return {
        "capability_ids": capability_ids,
        "ordered_capability_ids": ordered_capability_ids,
        "needs_clarification": bool(payload.get("needs_clarification", False)),
        "clarification_question": payload.get("clarification_question") or "",
        "reason": payload.get("reason") or "",
    }


def _resolve_capability_plan_auto_with_llm(message: str, prior_turns: list) -> dict:
    try:
        provider = OpenAIProvider()
        raw = provider.complete(
            "Route capability requests to capabilities: analytics, statistics, logistics, user_config.",
            message,
        )
        parsed = _parse_capability_router_output(raw)
        if parsed and parsed["ordered_capability_ids"]:
            warnings: list[str] = []
            if len(parsed["ordered_capability_ids"]) > 1:
                warnings.append("capability_chain_detected")
            return {
                "resolved_capability_id": parsed["ordered_capability_ids"][0],
                "ordered_capability_ids": parsed["ordered_capability_ids"],
                "resolution_source": "llm_router",
                "policy_warnings": warnings,
            }
    except Exception:
        pass

    capability_id, source, warnings = _resolve_capability_auto(message, prior_turns)
    return {
        "resolved_capability_id": capability_id,
        "ordered_capability_ids": [capability_id] if capability_id else [],
        "resolution_source": source,
        "policy_warnings": ["capability_router_llm_fallback_used", *warnings],
    }


def _parse_requested_capability_policy(
    payload: dict,
    *,
    invalid_input_behavior: str = "error",
) -> tuple[dict | None, dict | None]:
    context = (payload or {}).get("context") or {}
    requested_mode = context.get("capability_mode") or "auto"
    requested_id = context.get("capability_id")
    warnings: list[str] = []

    def _fallback(error_code: str, fallback_warning_code: str):
        if invalid_input_behavior == "fallback_auto":
            return {
                "requested_capability_mode": "auto",
                "requested_capability_id": None,
                "policy_warnings": [fallback_warning_code],
            }, None
        return None, {"code": error_code}

    if requested_mode not in {"auto", "manual"}:
        return _fallback("capability_policy_invalid_mode", "capability_mode_invalid_fallback_auto")

    if requested_mode == "manual":
        if not requested_id:
            return _fallback("capability_policy_missing_id", "capability_id_missing_fallback_auto")
        if requested_id not in CAPABILITY_REGISTRY:
            return _fallback("capability_policy_unknown_id", "capability_id_unknown_fallback_auto")
        return {
            "requested_capability_mode": "manual",
            "requested_capability_id": requested_id,
            "policy_warnings": warnings,
        }, None

    if requested_id:
        warnings.append("capability_id_ignored_in_auto_mode")
    return {
        "requested_capability_mode": "auto",
        "requested_capability_id": None,
        "policy_warnings": warnings,
    }, None


def _resolve_tool_policy(capability_id: str | None) -> str:
    if capability_id in _READONLY_CAPABILITIES:
        return "readonly"
    if capability_id is None:
        return "none"
    return "action"


def _merge_policy_metadata(
    *,
    data: dict | None,
    requested_mode: str,
    requested_capability_id: str | None,
    resolved_mode: str,
    resolved_capability_id: str | None,
    tool_policy: str,
    policy_warnings: list[str],
) -> dict:
    merged = dict(data or {})
    merged.update(
        {
            "requested_capability_mode": requested_mode,
            "requested_capability_id": requested_capability_id,
            "resolved_capability_mode": resolved_mode,
            "resolved_capability_id": resolved_capability_id,
            "tool_policy": tool_policy,
            "policy_warnings": policy_warnings,
        }
    )
    return merged


def _apply_tool_policy_to_response(response, tool_policy: str) -> None:
    if tool_policy in {"readonly", "none"} and getattr(response, "message", None) is not None:
        response.message.actions = []


# ---------------------------------------------------------------------------
# Statistics output parsing helpers
# ---------------------------------------------------------------------------

def _is_statistics_response(tool_turns: list[dict]) -> bool:
    """Check if this response came from statistics capability."""
    return any(turn.get("tool") == "get_analytics_snapshot" for turn in tool_turns)


def _parse_narrative_statistics_output(final_message: str) -> tuple[str, dict | None]:
    """
    Parse final_message as NarrativeStatisticalOutput JSON.
    
    Returns:
      (summary, data_dict): where summary is text content, data_dict is structured data
                            data_dict is None if parsing fails
    
    Guardrail: If blocks are empty or parsing fails, creates a fallback summary block.
    """
    if not final_message:
        return final_message, None
    
    try:
        payload = json.loads(final_message)
        # Validate against schema
        parsed = NarrativeStatisticalOutput(**payload)
        
        # Guardrail: if no blocks provided, create a fallback text block from summary
        if not parsed.blocks:
            fallback_block = {"type": "text", "text": parsed.summary}
            payload["blocks"] = [fallback_block]
            logger.info("Statistics response had empty blocks; created fallback text block")
        
        # Return summary as message content, full payload as data
        return parsed.summary, payload
    except (json.JSONDecodeError, ValueError) as e:
        logger.warning("Failed to parse statistics output JSON: %s | message=%r", e, final_message)
        # Create a fallback response with the raw message as a text block
        fallback_payload = {
            "summary": final_message,
            "blocks": [{"type": "text", "text": final_message}],
            "confidence_score": 0.0,
            "warnings": ["Failed to parse structured statistics output; presenting raw analysis."],
        }
        return final_message, fallback_payload





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

    # Parse statistics output if applicable
    if _is_statistics_response(result.tool_turns):
        final_message, parsed_data = _parse_narrative_statistics_output(result.final_message)
        result.final_message = final_message
        if parsed_data is not None:
            result.data = parsed_data

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

