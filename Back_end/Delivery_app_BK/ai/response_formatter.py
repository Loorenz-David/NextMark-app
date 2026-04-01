from __future__ import annotations

from collections.abc import Callable

from .schemas import (
    AIAction,
    AIThreadMessagePayload,
    AIThreadMessageResponse,
    AIThreadTurn,
    AIToolTraceEntry,
    NarrativeBlock,
)

# Registry 1: tool name -> summary function.
# Each function receives tool_params and tool_result, returns a human string.
# Registered during Phase 2+ as tools are implemented.
_SUMMARY_REGISTRY: dict[str, Callable[[dict, dict], str]] = {
    # "list_orders": _summarize_list_orders,
}

# Registry 2: tool name -> action generator.
# Each function receives tool_result, returns list[AIAction].
# Registered during Phase 2+ as tools are implemented.
_ACTION_REGISTRY: dict[str, Callable[[dict], list[AIAction]]] = {
    # "list_orders": _actions_for_list_orders,
}


def format_tool_trace(tool_turns: list[AIThreadTurn]) -> list[AIToolTraceEntry]:
    entries: list[AIToolTraceEntry] = []
    for i, turn in enumerate(tool_turns):
        tool = turn.tool_name or ""
        result = turn.tool_result or {}
        params = turn.tool_params or {}
        has_error = "error" in result
        status = "error" if has_error else "success"
        summary = _summarize(turn)
        entries.append(
            AIToolTraceEntry(
                id=f"tool_{i + 1}",
                tool=tool,
                status=status,
                summary=summary,
                params=params,
                result=result,
            )
        )
    return entries


def _summarize(tool_turn: AIThreadTurn) -> str:
    result = tool_turn.tool_result or {}
    if result.get("error"):
        name = tool_turn.tool_name or ""
        return f"{name} failed: {result.get('error', 'unknown error')}"

    name = tool_turn.tool_name or ""
    fn = _SUMMARY_REGISTRY.get(name)
    if fn:
        return fn(tool_turn.tool_params or {}, result)
    return f"Executed {name}."


def generate_actions(tool_turns: list[AIThreadTurn]) -> list[AIAction]:
    actions: list[AIAction] = []
    for turn in tool_turns:
        name = turn.tool_name or ""
        fn = _ACTION_REGISTRY.get(name)
        if fn:
            actions.extend(fn(turn.tool_result or {}))
    return actions


def collect_blocks(tool_turns: list[AIThreadTurn]) -> list[NarrativeBlock]:
    blocks: list[NarrativeBlock] = []
    for turn in tool_turns:
        raw = (turn.tool_result or {}).get("blocks", [])
        for b in raw:
            try:
                blocks.append(NarrativeBlock(**b))
            except Exception:
                pass
    return blocks


def format_response(
    thread_id: str,
    final_message: str,
    tool_turns: list[AIThreadTurn],
) -> AIThreadMessageResponse:
    tool_trace = format_tool_trace(tool_turns)
    actions = generate_actions(tool_turns)
    blocks = collect_blocks(tool_turns)
    payload = AIThreadMessagePayload(
        role="assistant",
        content=final_message,
        status_label="Completed",
        actions=actions,
        tool_trace=tool_trace,
        blocks=blocks if blocks else None,
        data=None,
    )
    return AIThreadMessageResponse(
        success=True,
        data={"thread_id": thread_id, "message": payload},
    )
