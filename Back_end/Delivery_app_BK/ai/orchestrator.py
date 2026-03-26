from __future__ import annotations
import json
import logging
import re
from dataclasses import dataclass, field

from Delivery_app_BK.services.context import ServiceContext

from .capabilities import get_capability_profile
from .model_selector import select_provider_for_stage
from .planner import get_next_step
from .tool_executor import execute_tool
from .providers.base import LLMProvider
from .schemas import AIInteraction, AIThreadTurn
from .stages import CLARIFY_STAGE, EXECUTE_STAGE, INTENT_STAGE

logger = logging.getLogger(__name__)

MAX_STEPS = 5


@dataclass
class OrchestratorResult:
    final_message: str
    tool_turns: list[dict] = field(default_factory=list)
    success: bool = True
    data: dict | None = None
    interactions: list[AIInteraction] = field(default_factory=list)
    reuse_recent_tool_turns: bool = True


def handle_ai_request_with_thread(
    ctx: ServiceContext | None,
    user_input: str,
    prior_turns: list[AIThreadTurn],
    provider: LLMProvider | None = None,
    system_prompt: str | None = None,
    capability_name: str = "logistics",
    stage_name: str = EXECUTE_STAGE,
    interaction_response_payload: dict | None = None,
) -> OrchestratorResult:
    """
    Run the planner loop, seeding it with prior thread turns as history.
    Returns a structured OrchestratorResult instead of an AIResponse.
    """
    ctx = ctx or ServiceContext(incoming_data={}, identity={})
    capability = get_capability_profile(capability_name)
    execute_provider = provider or select_provider_for_stage(capability_name, stage_name)

    # Convert stored thread turns into the planner's {tool, params, result} history format
    history: list[dict] = _turns_to_planner_history(prior_turns)
    tool_turns_this_request: list[dict] = []

    # Explicit rejection of confirm interactions should short-circuit.
    if interaction_response_payload and interaction_response_payload.get("confirm_accepted") is False:
        interaction_id = interaction_response_payload.get("__interaction_response__")
        for turn in prior_turns:
            if (
                turn.awaiting_response
                and turn.interaction_kind == "confirm"
                and turn.interaction_id == interaction_id
            ):
                return OrchestratorResult(
                    final_message="Cancelled by user. No changes were applied.",
                    tool_turns=[],
                    success=True,
                    data={
                        "interaction_cancelled": True,
                        "interaction_kind": "confirm",
                        "interaction_id": interaction_id,
                    },
                )

    if interaction_response_payload:
        _apply_interaction_response(ctx, history, interaction_response_payload)

    logger.info(
        "AI thread request | provider=%s | input=%r | prior_turns=%d",
        execute_provider.name,
        user_input,
        len(prior_turns),
    )

    try:
        operation: str | None = None

        # Pre-execution intent/clarify gate.
        can_run_intent_stage = (
            stage_name == EXECUTE_STAGE
            and not interaction_response_payload
            and provider is None
            and system_prompt is None
            and INTENT_STAGE in capability.prompt_builders
        )

        if can_run_intent_stage:
            intent_prompt = capability.build_prompt(INTENT_STAGE)
            intent_provider = select_provider_for_stage(capability_name, INTENT_STAGE)
            intent_step = get_next_step(user_input, history, intent_provider, system_prompt=intent_prompt)
            intent_type = _get_step_type(intent_step)
            intent_operation = _step_value(intent_step, "operation")
            needs_clarification = bool(_step_value(intent_step, "needs_clarification") or False)
            operation = intent_operation

            if intent_operation:
                ctx.ai_operation = intent_operation

            clarify_allowed = {
                "logistics": {"create_order"},
                "user_config": {"user_config", "item_taxonomy_config"},
                "statistics": {"analyze_metrics"},
            }
            if intent_type == "intent" and needs_clarification and intent_operation in clarify_allowed.get(capability_name, set()):
                clarify_prompt = capability.build_prompt(CLARIFY_STAGE, operation=intent_operation)
                clarify_provider = select_provider_for_stage(capability_name, CLARIFY_STAGE)
                clarify_step = get_next_step(user_input, history, clarify_provider, system_prompt=clarify_prompt)
                if _get_step_type(clarify_step) == "clarify":
                    interaction = _step_value(clarify_step, "interaction")
                    message = _step_value(clarify_step, "message") or "I need additional details."
                    return OrchestratorResult(
                        final_message=message,
                        tool_turns=[],
                        success=True,
                        data={"stage": CLARIFY_STAGE, "operation": intent_operation},
                        interactions=[interaction] if interaction else [],
                        reuse_recent_tool_turns=False,
                    )

        execute_prompt = system_prompt or capability.build_prompt(stage_name)
        allowed_tools = capability.get_tools(stage_name)
        planner_input = user_input
        statistics_repair_attempted = False
        retrieval_repair_attempted = False

        for step_num in range(MAX_STEPS):
            step = get_next_step(planner_input, history, execute_provider, system_prompt=execute_prompt)
            planner_input = user_input
            step_type = _get_step_type(step)

            if step_type == "final":
                message = _step_value(step, "message") or "Done."
                data: dict = {}
                presentation_hints = _step_value(step, "presentation_hints")
                if presentation_hints:
                    if hasattr(presentation_hints, "model_dump"):
                        data["presentation_hints"] = presentation_hints.model_dump()
                    else:
                        data["presentation_hints"] = presentation_hints

                required_tool = _required_retrieval_tool(operation, user_input)
                if (
                    capability_name == "logistics"
                    and required_tool
                    and not any(t.get("tool") == required_tool for t in tool_turns_this_request)
                    and not retrieval_repair_attempted
                ):
                    retrieval_repair_attempted = True
                    planner_input = (
                        f"Repair required: call tool '{required_tool}' before finalizing. "
                        f"Then return a final answer."
                    )
                    continue

                if capability_name == "statistics":
                    parsed = _parse_statistics_final_output(message)
                    if not parsed["ok"]:
                        if not statistics_repair_attempted:
                            statistics_repair_attempted = True
                            planner_input = (
                                "Repair required: return valid statistics JSON with keys "
                                "summary, blocks, warnings, confidence_score."
                            )
                            continue
                        return OrchestratorResult(
                            final_message="Could not produce a valid statistical output payload.",
                            tool_turns=tool_turns_this_request,
                            success=False,
                            data={
                                "stage": stage_name,
                                "statistical_output_validation": {
                                    "errors": parsed["errors"],
                                    "raw_error": parsed.get("raw_error"),
                                },
                            },
                        )

                    stats_data = parsed["data"]
                    stats_data["operation"] = operation
                    if statistics_repair_attempted:
                        stats_data["statistical_output_repair_applied"] = True
                    return OrchestratorResult(
                        final_message=parsed["final_message"],
                        tool_turns=tool_turns_this_request,
                        success=True,
                        data=stats_data,
                    )

                logger.info(
                    "AI thread request complete | steps=%d | message=%r",
                    step_num + 1,
                    message,
                )
                return OrchestratorResult(
                    final_message=message,
                    tool_turns=tool_turns_this_request,
                    success=True,
                    data=data or None,
                )

            if step_type == "clarify":
                interaction = _step_value(step, "interaction")
                message = _step_value(step, "message") or "I need additional details."
                return OrchestratorResult(
                    final_message=message,
                    tool_turns=tool_turns_this_request,
                    success=True,
                    data={"stage": CLARIFY_STAGE},
                    interactions=[interaction] if interaction else [],
                    reuse_recent_tool_turns=False,
                )

            if step_type == "tool":
                tool_name = _step_value(step, "tool") or ""
                params = _step_value(step, "parameters") or {}

                try:
                    result = execute_tool(ctx, tool_name, params, allowed_tools=allowed_tools)
                except Exception as e:
                    logger.warning("Tool execution failed | tool=%s | error=%s", tool_name, e)
                    result = {"error": str(e)}
                    code = getattr(e, "code", None)
                    if code:
                        result["error_code"] = code

                entry = {"tool": tool_name, "params": params, "result": result}
                history.append(entry)
                tool_turns_this_request.append(entry)
                continue

            logger.warning("Unknown step type from planner: %s", step)
            break

        logger.warning("AI request hit MAX_STEPS=%d", MAX_STEPS)
        return OrchestratorResult(
            final_message="Max steps reached without completing the request.",
            tool_turns=tool_turns_this_request,
            success=False,
            data={"stage": stage_name},
        )

    except Exception as e:
        logger.exception("Unexpected error in AI request | input=%r", user_input)
        return OrchestratorResult(
            final_message=str(e),
            tool_turns=tool_turns_this_request,
            success=False,
            data={"stage": stage_name},
        )


def _turns_to_planner_history(turns: list[AIThreadTurn]) -> list[dict]:
    """
    Convert stored thread turns → planner message history.

    We replay all roles so the LLM has full conversational context across
    requests — user questions, tool calls, tool results, and prior answers.
    Without user + assistant turns, pronouns like "those orders" or "them"
    have no antecedent and the LLM loses cross-turn context.

    Planner message format:
      user turn      → {"role": "user",      "content": <question>}
      tool turn      → {"role": "assistant",  "content": JSON tool call}
                       {"role": "user",       "content": "Tool result for X: ..."}
      assistant turn → {"role": "assistant",  "content": JSON final answer}
    """
    history: list[dict] = []
    for turn in turns:
        if turn.role == "user":
            if turn.interaction_response_id and isinstance(turn.interaction_form, dict):
                normalized = _extract_normalized_facts(turn.interaction_form)
                payload = {
                    "type": "interaction_response",
                    "interaction_id": turn.interaction_response_id,
                    "response": turn.interaction_form,
                    "normalized_facts": normalized,
                }
                history.append({"role": "user", "content": json.dumps(payload)})
            else:
                history.append({"role": "user", "content": turn.content})

        elif turn.role == "tool" and turn.tool_name:
            history.append({
                "role": "assistant",
                "content": json.dumps({
                    "type": "tool",
                    "tool": turn.tool_name,
                    "parameters": turn.tool_params or {},
                }),
            })
            history.append({
                "role": "user",
                "content": f"Tool result for {turn.tool_name}: {json.dumps(turn.tool_result or {})}",
            })

        elif turn.role == "assistant":
            history.append({
                "role": "assistant",
                "content": json.dumps({
                    "type": "final",
                    "message": turn.content,
                }),
            })

    return history


def _apply_interaction_response(ctx: ServiceContext, history: list[dict], payload: dict) -> None:
    interaction_id = payload.get("__interaction_response__")
    form_response = payload.get("interaction_form") or payload.get("response") or {}
    normalized = _extract_normalized_facts(form_response if isinstance(form_response, dict) else {})
    explicit_timeframe = ((form_response or {}).get("timeframe") if isinstance(form_response, dict) else None)
    if explicit_timeframe:
        normalized["statistics_timeframe"] = _normalize_timeframe(explicit_timeframe)
    elif payload.get("fallback_timeframe"):
        normalized["statistics_timeframe"] = _normalize_timeframe(payload.get("fallback_timeframe"))
        normalized["statistics_timeframe_fallback_applied"] = True
    history.append(
        {
            "role": "user",
            "content": json.dumps(
                {
                    "type": "interaction_response",
                    "interaction_id": interaction_id,
                    "response": form_response,
                    "normalized_facts": normalized,
                }
            ),
        }
    )
    execution_payload = (ctx.incoming_data or {}).get("_ai_execution") or {}
    execution_payload["normalized_facts"] = normalized
    execution_payload["confirm_accepted"] = payload.get("confirm_accepted")
    ctx.incoming_data["_ai_execution"] = execution_payload


def _extract_normalized_facts(form_data: dict) -> dict:
    normalized: dict = {}
    email = form_data.get("client_email")
    if isinstance(email, str) and email.strip():
        normalized["client_email"] = email.strip()

    phone_raw = form_data.get("client_phone")
    if isinstance(phone_raw, str) and phone_raw.strip():
        stripped = phone_raw.strip()
        normalized["client_primary_phone"] = _parse_phone(stripped)
        normalized["client_phone_raw"] = stripped
    return normalized


def _parse_phone(raw: str) -> dict:
    compact = "".join(ch for ch in raw if ch.isdigit() or ch == "+")
    if compact.startswith("+46"):
        number = "".join(ch for ch in compact[3:] if ch.isdigit())
        return {"prefix": "+46", "number": number}
    if compact.startswith("+"):
        rest_digits = "".join(ch for ch in compact if ch.isdigit())
        prefix = "+" + rest_digits[:2] if len(rest_digits) >= 2 else "+1"
        number = rest_digits[len(prefix) - 1 :]
        return {"prefix": prefix, "number": number}
    return {"prefix": "+46", "number": "".join(ch for ch in compact if ch.isdigit())}


def _get_step_type(step: object) -> str | None:
    if isinstance(step, dict):
        return step.get("type")
    return getattr(step, "type", None)


def _step_value(step: object, key: str):
    if isinstance(step, dict):
        return step.get(key)
    return getattr(step, key, None)


def _normalize_timeframe(raw: str | None) -> str:
    value = (raw or "").strip().lower()
    mapping = {
        "24h": "24h",
        "today": "24h",
        "7d": "7d",
        "last_7_days": "7d",
        "30d": "30d",
        "last_30_days": "30d",
        "month": "30d",
    }
    return mapping.get(value, "7d")


def _parse_statistics_final_output(message: str) -> dict:
    try:
        payload = json.loads(message)
    except Exception as exc:
        return {
            "ok": False,
            "errors": [{"loc": ("json",), "msg": str(exc)}],
            "raw_error": str(exc),
        }

    if not isinstance(payload, dict):
        return {"ok": False, "errors": [{"loc": ("root",), "msg": "must be object"}]}

    # New narrative contract.
    narrative_required = ["summary", "blocks", "warnings", "confidence_score"]
    missing_narrative = [k for k in narrative_required if k not in payload]
    if not missing_narrative:
        return {
            "ok": True,
            "final_message": payload.get("summary", ""),
            "data": {
                "statistics_output_kind": "narrative",
                "blocks": payload.get("blocks") or [],
                "warnings": payload.get("warnings") or [],
                "confidence_score": payload.get("confidence_score"),
            },
        }

    # Legacy contract.
    if "key_metrics" in payload and "insights" in payload:
        return {
            "ok": True,
            "final_message": payload.get("summary", ""),
            "data": {
                "statistics_output_kind": "legacy",
                "statistical_output": payload,
            },
        }

    errors = [{"loc": (key,), "msg": "field required"} for key in missing_narrative]
    return {"ok": False, "errors": errors}


def _required_retrieval_tool(operation: str | None, user_input: str) -> str | None:
    if operation in {"list_orders", "list_plans", "list_routes"}:
        return operation
    lower = user_input.lower()
    if "order" in lower:
        return "list_orders"
    if "plan" in lower:
        return "list_plans"
    if "route" in lower:
        return "list_routes"
    return None


def _normalize_insight_depth(value: str | None) -> str:
    normalized = (value or "none").strip().lower()
    if normalized in {"risk_brief", "diagnostic", "none"}:
        return normalized
    return "none"


def _has_retrieval_entities(tool_turns: list[dict]) -> bool:
    for turn in tool_turns:
        result = turn.get("result") or {}
        rows = result.get("order") or result.get("orders") or result.get("delivery_plan") or result.get("delivery_plans") or []
        if isinstance(rows, list) and rows:
            return True
        if isinstance(rows, dict):
            return True
        if (result.get("count") or 0) > 0:
            return True
    return False


def _infer_analytics_timeframe(user_input: str) -> str:
    text = (user_input or "").lower()
    if "today" in text or "24h" in text:
        return "24h"
    if "month" in text or "30d" in text or "30 days" in text:
        return "30d"
    return "7d"


def _should_chain_logistics_analytics(
    capability_name: str,
    operation: str | None,
    insight_depth: str,
    result: OrchestratorResult,
) -> bool:
    if capability_name != "logistics":
        return False
    if _normalize_insight_depth(insight_depth) == "none":
        return False
    if not result.success:
        return False
    if operation not in {"list_orders", "list_plans", "list_routes"}:
        return False
    if any(turn.get("tool") == "get_analytics_snapshot" for turn in result.tool_turns):
        return False
    return _has_retrieval_entities(result.tool_turns)


def _append_logistics_analytics_snapshot(
    ctx: ServiceContext,
    user_input: str,
    result: OrchestratorResult,
    insight_depth: str,
) -> None:
    timeframe = _infer_analytics_timeframe(user_input)
    allowed_tools = get_capability_profile("statistics").get_tools(EXECUTE_STAGE)
    analytics_result = execute_tool(
        ctx,
        "get_analytics_snapshot",
        {"timeframe": timeframe},
        allowed_tools=allowed_tools,
    )
    result.tool_turns.append(
        {
            "tool": "get_analytics_snapshot",
            "params": {"timeframe": timeframe},
            "result": analytics_result,
        }
    )
    result.data = result.data or {}
    result.data["insight_depth"] = _normalize_insight_depth(insight_depth)
    result.data["analytics_timeframe"] = timeframe


# ---------------------------------------------------------------------------
# V1 entry point — removed. All callers should use handle_ai_request_with_thread.
# ---------------------------------------------------------------------------

