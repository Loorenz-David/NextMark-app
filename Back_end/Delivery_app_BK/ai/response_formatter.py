from __future__ import annotations

import logging
from uuid import uuid4

from .schemas import (
    AIAction,
    AIThreadMessagePayload,
    AIThreadMessageResponse,
    AIToolTraceEntry,
)

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Tool trace
# ---------------------------------------------------------------------------

def format_tool_trace(tool_turns: list[dict]) -> list[AIToolTraceEntry]:
    entries: list[AIToolTraceEntry] = []
    for i, turn in enumerate(tool_turns):
        tool = turn.get("tool", "")
        result = turn.get("result") or {}
        params = turn.get("params") or {}
        has_error = "error" in result
        status = "error" if has_error else "success"
        summary = _summarize(tool, result, has_error)
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


def _summarize(tool: str, result: dict, has_error: bool) -> str:
    if has_error:
        return f"{tool} failed: {result.get('error', 'unknown error')}"

    if tool == "list_orders":
        count = result.get("count") or len(result.get("orders") or [])
        return f"Found {count} order{'s' if count != 1 else ''}."

    if tool == "list_plans":
        plans = result.get("delivery_plans") or result.get("plans") or []
        count = result.get("count") or len(plans)
        return f"Found {count} plan{'s' if count != 1 else ''}."

    if tool == "assign_orders_to_plan" or tool == "assign_orders":
        count = result.get("updated") or result.get("count") or 0
        return f"Assigned {count} order{'s' if count != 1 else ''} to plan."

    if tool == "create_plan":
        plan_id = result.get("plan_id")
        return f"Created plan {plan_id}." if plan_id else "Plan created."

    if tool == "optimize_plan":
        return "Route optimization completed."

    if tool == "get_plan_summary":
        plan = result.get("delivery_plan") or {}
        label = plan.get("label")
        return f"Retrieved plan '{label}'." if label else "Plan details retrieved."

    if tool == "update_order_state":
        count = result.get("count", 0)
        state = result.get("state", "")
        return f"Updated {count} order{'s' if count != 1 else ''} to '{state}'."

    if tool == "update_order":
        order_id = result.get("order_id", "")
        updated = result.get("updated_fields") or []
        fields_str = ", ".join(updated) if updated else "fields"
        return f"Updated order #{order_id} ({fields_str})."

    if tool == "get_plan_execution_status":
        status = result.get("status")
        if status == "no_route_selected":
            return "No active route selected for this plan."
        if status == "not_supported":
            return f"Route visibility not available for plan type '{result.get('plan_type')}'."
        stops = result.get("stops_count", 0)
        driver = result.get("driver_id")
        driver_str = f", driver #{driver}" if driver else ", no driver assigned"
        return f"Active route has {stops} stop{'s' if stops != 1 else ''}{driver_str}."

    if tool == "list_routes":
        count = result.get("count", len(result.get("routes") or []))
        return f"Found {count} route{'s' if count != 1 else ''}."

    if tool == "search_item_types":
        count = result.get("count", 0)
        return f"Found {count} item type{'s' if count != 1 else ''} in catalog."

    if tool == "add_items_to_order":
        order_id = result.get("order_id", "")
        count = result.get("items_added", 0)
        return f"Added {count} item{'s' if count != 1 else ''} to order #{order_id}."

    if tool == "create_order":
        order_id = result.get("order_id")
        items_created = result.get("items_created", 0)
        id_str = f" #{order_id}" if order_id else ""
        items_str = f" with {items_created} item{'s' if items_created != 1 else ''}" if items_created else ""
        return f"Created order{id_str}{items_str}."

    return f"{tool} completed."


# ---------------------------------------------------------------------------
# Action generation (deterministic, no LLM prose)
# ---------------------------------------------------------------------------

def generate_actions(tool_turns: list[dict]) -> list[AIAction]:
    actions: list[AIAction] = []
    seen_tools = {t.get("tool") for t in tool_turns}

    for turn in tool_turns:
        tool = turn.get("tool", "")
        result = turn.get("result") or {}
        params = turn.get("params") or {}

        if "error" in result:
            continue

        if tool == "list_orders":
            # Navigate to orders workspace
            if "navigate_orders" not in {a.id for a in actions}:
                actions.append(AIAction(
                    id="navigate_orders",
                    type="navigate",
                    label="Open orders",
                    payload={"path": "/"},
                ))
            # Apply the same filters that were used
            filter_payload = _extract_order_filters(params, result)
            if filter_payload:
                actions.append(AIAction(
                    id=f"filter_orders_{uuid4().hex[:6]}",
                    type="apply_order_filters",
                    label="Apply filter",
                    payload=filter_payload,
                ))

        elif tool == "list_plans":
            if "navigate_plans" not in {a.id for a in actions}:
                actions.append(AIAction(
                    id="navigate_plans",
                    type="navigate",
                    label="Open plans",
                    payload={"path": "/plans"},
                ))

        elif tool in ("assign_orders_to_plan", "assign_orders"):
            plan_id = params.get("plan_id") or params.get("delivery_plan_id")
            if plan_id:
                actions.append(AIAction(
                    id=f"navigate_plan_{plan_id}",
                    type="navigate",
                    label=f"Open plan {plan_id}",
                    payload={"path": f"/plans/{plan_id}"},
                ))

        elif tool == "update_order_state":
            if "navigate_orders" not in {a.id for a in actions}:
                actions.append(AIAction(
                    id="navigate_orders",
                    type="navigate",
                    label="Open orders",
                    payload={"path": "/"},
                ))

        elif tool == "create_order":
            order_id = result.get("order_id")
            if order_id and f"navigate_order_{order_id}" not in {a.id for a in actions}:
                actions.append(AIAction(
                    id=f"navigate_order_{order_id}",
                    type="navigate",
                    label=f"Open order #{order_id}",
                    payload={"path": f"/orders/{order_id}"},
                ))

        elif tool in ("get_plan_execution_status", "list_routes"):
            plan_id = params.get("plan_id") or result.get("plan_id")
            if plan_id and f"navigate_plan_{plan_id}" not in {a.id for a in actions}:
                actions.append(AIAction(
                    id=f"navigate_plan_{plan_id}",
                    type="navigate",
                    label=f"Open plan {plan_id}",
                    payload={"path": f"/plans/{plan_id}"},
                ))

    return actions


def _extract_order_filters(params: dict, result: dict) -> dict | None:
    """Convert list_orders tool params into apply_order_filters payload."""
    filters: dict = {}

    if params.get("scheduled") is not None:
        filters["unschedule_order"] = not params["scheduled"]
    if params.get("plan_id") is not None:
        filters["plan_id"] = params["plan_id"]
    if params.get("q"):
        filters["q"] = params["q"]
    if params.get("sort"):
        filters["sort"] = params["sort"]

    if not filters:
        return None

    return {
        "mode": "replace",
        "filters": filters,
    }


# ---------------------------------------------------------------------------
# Final response assembly
# ---------------------------------------------------------------------------

def format_response(
    thread_id: str,
    final_message: str,
    tool_turns: list[dict],
    *,
    success: bool = True,
    data: dict | None = None,
) -> AIThreadMessageResponse:
    tool_trace = format_tool_trace(tool_turns)
    actions = generate_actions(tool_turns)
    status_label = "Completed" if success else "Failed"

    payload = AIThreadMessagePayload(
        role="assistant",
        content=final_message,
        status_label=status_label,
        actions=actions,
        tool_trace=tool_trace,
        data=data,
    )

    return AIThreadMessageResponse(thread_id=thread_id, message=payload)
