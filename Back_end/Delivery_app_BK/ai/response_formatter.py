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


# ── Summary functions ─────────────────────────────────────────────────────────

def _summarize_get_plan_snapshot(params: dict, result: dict) -> str:
    label = result.get("plan_label", f"plan #{params.get('plan_id', '?')}")
    total = result.get("total_orders", "?")
    groups = result.get("group_count", "?")
    return f"Plan '{label}': {total} orders across {groups} group(s)."


def _summarize_get_route_group_snapshot(params: dict, result: dict) -> str:
    zone = result.get("zone_name", "unknown group")
    total = result.get("total_orders", "?")
    state = result.get("state_name", "")
    return f"Route group '{zone}': {total} orders, state: {state}."


def _summarize_get_operations_dashboard(params: dict, result: dict) -> str:
    date = result.get("date", "?")
    plans = result.get("plan_count", "?")
    orders = result.get("total_orders", "?")
    return f"Operations on {date}: {plans} plan(s), {orders} orders."


def _summarize_evaluate_order_route_fit(params: dict, result: dict) -> str:
    order_id = result.get("order_id", params.get("order_id", "?"))
    within = result.get("within_corridor")
    detour_s = result.get("estimated_detour_seconds")
    detour_min = round(detour_s / 60, 1) if detour_s is not None else "?"
    fit_str = "fits within" if within else "is outside"
    return f"Order #{order_id} {fit_str} route corridor. Estimated detour: {detour_min} min."


def _summarize_geocode_address(params: dict, result: dict) -> str:
    found = result.get("found", False)
    q = params.get("q", "?")
    if found:
        formatted = result.get("formatted_address", q)
        return f"Geocoded '{q}' → '{formatted}'."
    return f"No geocoding result for '{q}'."


def _summarize_list_orders(params: dict, result: dict) -> str:
    count = result.get("count", 0)
    total = result.get("total")
    filters = result.get("filters_applied") or {}
    context = []
    if filters.get("plan_id"):
        context.append(f"plan #{filters['plan_id']}")
    if filters.get("state"):
        context.append(f"state: {filters['state']}")
    if filters.get("scheduled") is False:
        context.append("unscheduled")
    ctx_str = f" ({', '.join(context)})" if context else ""
    total_str = f" of {total}" if total is not None and total != count else ""
    return f"Found {count}{total_str} orders{ctx_str}."


def _summarize_list_plans(params: dict, result: dict) -> str:
    count = result.get("count", 0)
    filters = result.get("filters_applied") or {}
    context = []
    if filters.get("state"):
        context.append(f"state: {filters['state']}")
    if filters.get("covers_date"):
        context.append(f"date: {filters['covers_date']}")
    ctx_str = f" ({', '.join(context)})" if context else ""
    return f"Found {count} plan(s){ctx_str}."


def _summarize_list_route_groups(params: dict, result: dict) -> str:
    count = result.get("count", 0)
    plan_id = result.get("plan_id", params.get("plan_id", "?"))
    return f"Found {count} route group(s) in plan #{plan_id}."


def _summarize_list_zones(params: dict, result: dict) -> str:
    count = result.get("count", 0)
    return f"Found {count} zone(s)."


def _summarize_get_zone_snapshot(params: dict, result: dict) -> str:
    name = result.get("zone_name", f"zone #{params.get('zone_id', '?')}")
    orders = result.get("assigned_order_count", "?")
    util = result.get("utilization_pct")
    util_str = f", {util}% capacity" if util is not None else ""
    return f"Zone '{name}': {orders} assigned orders{util_str}."


# ── Action functions ──────────────────────────────────────────────────────────

def _actions_for_get_plan_snapshot(result: dict) -> list:
    plan_id = result.get("plan_id")
    if not plan_id:
        return []
    return [{
        "id": f"navigate_plan_{plan_id}",
        "type": "navigate",
        "label": "Open Plan",
        "payload": {"path": f"/plans/{plan_id}"},
    }]


def _actions_for_get_route_group_snapshot(result: dict) -> list:
    plan_id = result.get("route_plan_id")
    group_id = result.get("route_group_id")
    if not plan_id:
        return []
    path = f"/plans/{plan_id}" if not group_id else f"/plans/{plan_id}?group={group_id}"
    return [{
        "id": f"navigate_plan_{plan_id}",
        "type": "navigate",
        "label": "Open Route Group",
        "payload": {"path": path},
    }]


def _actions_for_get_operations_dashboard(result: dict) -> list:
    return [{
        "id": "navigate_plans",
        "type": "navigate",
        "label": "View Plans",
        "payload": {"path": "/plans"},
    }]


def _actions_for_evaluate_order_route_fit(result: dict) -> list:
    return []


def _actions_for_geocode_address(result: dict) -> list:
    return []


def _actions_for_list_orders(result: dict) -> list:
    filters = result.get("filters_applied") or {}
    actions = []
    actions.append({
        "id": "navigate_orders",
        "type": "navigate",
        "label": "Open Orders",
        "payload": {"path": "/"},
    })

    filter_payload: dict = {}
    if filters.get("scheduled") is False:
        filter_payload["unschedule_order"] = True
    if filters.get("scheduled") is True:
        filter_payload["schedule_order"] = True
    if filters.get("state"):
        filter_payload["order_state"] = filters["state"]
    if filters.get("plan_id"):
        filter_payload["plan_id"] = filters["plan_id"]
    if filter_payload:
        actions.append({
            "id": "apply_order_filters",
            "type": "apply_order_filters",
            "label": "Apply Filters",
            "payload": {"mode": "replace", "filters": filter_payload},
        })
    return actions


def _actions_for_list_plans(result: dict) -> list:
    return [{
        "id": "navigate_plans",
        "type": "navigate",
        "label": "View Plans",
        "payload": {"path": "/plans"},
    }]


def _actions_for_list_route_groups(result: dict) -> list:
    plan_id = result.get("plan_id")
    if not plan_id:
        return []
    return [{
        "id": f"navigate_plan_{plan_id}",
        "type": "navigate",
        "label": "Open Plan",
        "payload": {"path": f"/plans/{plan_id}"},
    }]


def _actions_for_list_zones(result: dict) -> list:
    return []


def _actions_for_get_zone_snapshot(result: dict) -> list:
    return []


# ── Registries ────────────────────────────────────────────────────────────────

# Registry 1: tool name -> summary function.
# Each function receives tool_params and tool_result, returns a human string.
_SUMMARY_REGISTRY: dict[str, Callable[[dict, dict], str]] = {
    "get_plan_snapshot":         _summarize_get_plan_snapshot,
    "get_route_group_snapshot":  _summarize_get_route_group_snapshot,
    "get_operations_dashboard":  _summarize_get_operations_dashboard,
    "evaluate_order_route_fit":  _summarize_evaluate_order_route_fit,
    "geocode_address":           _summarize_geocode_address,
    "list_orders":               _summarize_list_orders,
    "list_plans":                _summarize_list_plans,
    "list_route_groups":         _summarize_list_route_groups,
    "list_zones":                _summarize_list_zones,
    "get_zone_snapshot":         _summarize_get_zone_snapshot,
}

# Registry 2: tool name -> action generator.
# Each function receives tool_result, returns list[AIAction].
_ACTION_REGISTRY: dict[str, Callable[[dict], list[AIAction]]] = {
    "get_plan_snapshot":         _actions_for_get_plan_snapshot,
    "get_route_group_snapshot":  _actions_for_get_route_group_snapshot,
    "get_operations_dashboard":  _actions_for_get_operations_dashboard,
    "evaluate_order_route_fit":  _actions_for_evaluate_order_route_fit,
    "geocode_address":           _actions_for_geocode_address,
    "list_orders":               _actions_for_list_orders,
    "list_plans":                _actions_for_list_plans,
    "list_route_groups":         _actions_for_list_route_groups,
    "list_zones":                _actions_for_list_zones,
    "get_zone_snapshot":         _actions_for_get_zone_snapshot,
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
