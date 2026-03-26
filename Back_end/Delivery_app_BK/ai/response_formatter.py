from __future__ import annotations

import logging
import re
from uuid import uuid4

from .schemas import (
    AIBlock,
    AIAction,
    AIInteraction,
    AIThreadMessagePayload,
    AIThreadMessageResponse,
    AIToolTraceEntry,
    AITypedWarning,
)

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Narrative statistics block mapping
# ---------------------------------------------------------------------------

def _is_narrative_statistics_response(tool_turns: list[dict]) -> bool:
    """Check if this response contains narrative statistics blocks."""
    return any(turn.get("tool") == "get_analytics_snapshot" for turn in tool_turns)


def _map_narrative_blocks_to_renderable(data: dict) -> dict:
    """
    Map narrative block structure to renderable block format.
    
    Transforms blocks array while preserving order and structure.
    Adds rendering hints for narrative statistics responses.
    """
    if not data or "blocks" not in data:
        return data
    
    blocks = data.get("blocks", [])
    mapped_blocks = []
    
    for block in blocks:
        if not isinstance(block, dict):
            logger.warning("Skipping non-dict block: %s", type(block))
            continue
        
        block_type = block.get("type")
        
        if block_type == "text":
            # Map text block directly with summary layout
            mapped_blocks.append({
                "id": f"block_{uuid4().hex[:8]}",
                "kind": "summary",
                "title": block.get("title"),
                "data": {
                    "text": block.get("text", ""),
                    "layout": "narrative",
                },
            })
        
        elif block_type == "analytics_kpi":
            # Map KPI block to analytics_kpi kind
            mapped_blocks.append({
                "id": f"block_{uuid4().hex[:8]}",
                "kind": "analytics_kpi",
                "title": block.get("title"),
                "data": {
                    "metric_name": block.get("metric_name", ""),
                    "value": block.get("value", 0),
                    "delta": block.get("delta"),
                    "unit": block.get("unit"),
                    "confidence_score": block.get("confidence_score", 0.5),
                },
            })
        
        elif block_type == "analytics_trend":
            # Map trend block to analytics_trend kind
            mapped_blocks.append({
                "id": f"block_{uuid4().hex[:8]}",
                "kind": "analytics_trend",
                "title": block.get("title"),
                "data": {
                    "title": block.get("title", ""),
                    "description": block.get("description", ""),
                    "direction": block.get("direction"),
                    "confidence_score": block.get("confidence_score", 0.5),
                    "data_points": block.get("data_points", []),
                },
            })
        
        elif block_type == "analytics_breakdown":
            # Map breakdown block to analytics_breakdown kind
            mapped_blocks.append({
                "id": f"block_{uuid4().hex[:8]}",
                "kind": "analytics_breakdown",
                "title": block.get("title"),
                "data": {
                    "title": block.get("title", ""),
                    "description": block.get("description"),
                    "components": block.get("components", []),
                    "confidence_score": block.get("confidence_score", 0.5),
                },
            })
        
        else:
            logger.warning("Unknown narrative block type: %s", block_type)
    
    # Return data with mapped blocks and rendering hints
    result = data.copy()
    result["blocks"] = mapped_blocks
    result["rendering_hints"] = {
        "has_blocks": len(mapped_blocks) > 0,
        "suppress_raw_data_preview": True,
        "text_section_title": "Analysis",
        "block_section_title": "Insights",
    }
    
    return result


def _to_list(value):
    if isinstance(value, list):
        return value
    if isinstance(value, dict):
        return [value]
    return []


def _get_orders(result: dict) -> list[dict]:
    return _to_list(result.get("orders") or result.get("order"))


def _get_plans(result: dict) -> list[dict]:
    return _to_list(result.get("route_plans") or result.get("route_plan") or result.get("plans"))


def _orders_total(result: dict, orders: list[dict]) -> int:
    nested = (result.get("order_stats") or {}).get("orders") or {}
    return result.get("count") or nested.get("total") or (result.get("order_stats") or {}).get("total") or len(orders)


def _plans_total(result: dict, plans: list[dict]) -> int:
    nested = (result.get("route_plan_stats") or {}).get("plans") or {}
    return result.get("count") or nested.get("total") or len(plans)


def _build_order_items(orders: list[dict]) -> list[dict]:
    items: list[dict] = []
    for row in orders:
        first = (row.get("client_first_name") or "").strip()
        last = (row.get("client_last_name") or "").strip()
        full_name = f"{first} {last}".strip() or row.get("client_name") or ""
        scalar = row.get("order_scalar_id")
        items.append(
            {
                "id": row.get("id"),
                "reference": f"Order {scalar}" if scalar else None,
                "order_scalar_id": scalar,
                "client_name": full_name,
                "status": row.get("order_state_id"),
                "street_address": ((row.get("client_address") or {}).get("street_address") if isinstance(row.get("client_address"), dict) else None),
                "total_items": row.get("total_items"),
                "route_plan_id": row.get("route_plan_id"),
                "is_late": bool(row.get("is_late")),
            }
        )
    return items


def _infer_order_columns(params: dict, message_query: str | None, hints: dict | None) -> list[str]:
    allowed = {"reference", "order_scalar_id", "client_name", "status", "street_address", "total_items"}
    if hints and isinstance(hints.get("blocks"), list):
        for block_hint in hints["blocks"]:
            if block_hint.get("entity_type") == "order":
                requested = [c for c in (block_hint.get("columns") or []) if c in allowed]
                if requested:
                    return requested

    search_fields = params.get("s") or []
    if "client_first_name" in search_fields or "client_last_name" in search_fields:
        return ["client_name", "order_scalar_id", "status", "street_address"]

    if "order_scalar_id" in search_fields:
        return ["order_scalar_id", "client_name", "status", "street_address"]

    if message_query and "contain items" in message_query.lower():
        return ["reference", "total_items", "status", "street_address"]

    return ["status", "order_scalar_id", "client_name"]


def _compute_order_ai_focus(items: list[dict]) -> dict | None:
    focus_ids: list[str] = []
    late = 0
    unassigned = 0
    for item in items:
        item_id = item.get("id")
        if item.get("is_late"):
            late += 1
            if item_id is not None:
                focus_ids.append(str(item_id))
        if item.get("route_plan_id") is None:
            unassigned += 1
            if item_id is not None:
                focus_ids.append(str(item_id))
    if not focus_ids:
        return None
    unique_ids = []
    for entry in focus_ids:
        if entry not in unique_ids:
            unique_ids.append(entry)
    return {
        "focus_entity_ids": unique_ids,
        "focus_counts": {"late": late, "unassigned": unassigned},
    }


def _map_data_blocks(data: dict) -> tuple[list[AIBlock], dict]:
    hints: dict = {}
    blocks: list[AIBlock] = []
    for block in data.get("blocks") or []:
        if isinstance(block, dict) and block.get("kind"):
            blocks.append(
                AIBlock(
                    id=block.get("id") or f"block_{uuid4().hex[:8]}",
                    kind=block.get("kind"),
                    entity_type=block.get("entity_type") or "generic",
                    layout=block.get("layout") or "summary",
                    title=block.get("title"),
                    subtitle=block.get("subtitle"),
                    data=block.get("data") or {},
                    meta=block.get("meta") or {"schema_version": 1},
                )
            )
            continue

        block_type = block.get("type")
        if block_type == "text":
            blocks.append(
                AIBlock(
                    id=f"block_{uuid4().hex[:8]}",
                    kind="summary",
                    entity_type="generic",
                    layout="narrative",
                    title=block.get("title"),
                    data={"text": block.get("text", "")},
                    meta={"schema_version": 1},
                )
            )
            continue
        if block_type in {"analytics_kpi", "analytics_trend", "analytics_breakdown"}:
            entity_type = block_type
            blocks.append(
                AIBlock(
                    id=f"block_{uuid4().hex[:8]}",
                    kind=block_type,
                    entity_type=entity_type,
                    layout="table",
                    title=block.get("title"),
                    data={k: v for k, v in block.items() if k not in {"type", "title"}},
                    meta={"schema_version": 1},
                )
            )
            continue
        if block_type == "analytics":
            blocks.append(
                AIBlock(
                    id=f"block_{uuid4().hex[:8]}",
                    kind="analytics",
                    entity_type="analytics",
                    layout=block.get("layout", "table"),
                    title=block.get("title"),
                    subtitle=block.get("subtitle"),
                    data=block.get("data") or {},
                    meta={"schema_version": 1, "chartType": block.get("chartType")},
                )
            )
    if blocks:
        hints = {
            "has_blocks": True,
            "suppress_raw_data_preview": True,
            "text_section_title": "Analysis",
            "block_section_title": "Insights",
        }
    return blocks, hints


def _extract_latest_metrics(tool_turns: list[dict]) -> dict:
    for turn in reversed(tool_turns):
        if turn.get("tool") == "get_analytics_snapshot":
            result = turn.get("result") or {}
            return result.get("metrics") or {}
    return {}


def _build_risk_brief_block(tool_turns: list[dict], insight_depth: str | None) -> AIBlock | None:
    if insight_depth in (None, "none"):
        return None
    metrics = _extract_latest_metrics(tool_turns)
    if not metrics:
        return None
    failed = int(metrics.get("failed_orders") or 0)
    unscheduled = int(metrics.get("unscheduled_orders") or 0)
    completion_rate = float(metrics.get("completion_rate") or 0)

    if failed > 0 or completion_rate < 0.85:
        level = "high"
        text = "Operational risk is high due to failed orders or low completion."
    elif unscheduled > 0:
        level = "medium"
        text = "Operational risk is moderate due to unscheduled volume."
    else:
        level = "low"
        text = "Operational risk is stable with healthy completion and no failures."

    return AIBlock(
        id=f"block_{uuid4().hex[:8]}",
        kind="summary",
        entity_type="analytics_risk",
        layout="summary",
        title="Risk brief",
        data={"risk_level": level, "text": text, "insight_depth": insight_depth},
        meta={"schema_version": 1},
    )


def _apply_ai_led_focus(blocks: list[AIBlock], final_message: str, operation_name: str | None) -> None:
    if not blocks:
        return
    if operation_name == "list_plans":
        ids = re.findall(r"\bplan\s+(\d+)\b", final_message, flags=re.IGNORECASE)
    elif operation_name == "list_routes":
        ids = re.findall(r"\broute\s+(\d+)\b", final_message, flags=re.IGNORECASE)
    else:
        ids = []
    if not ids:
        return
    unique_ids: list[str] = []
    for ident in ids:
        if ident not in unique_ids:
            unique_ids.append(ident)
    blocks[0].data["ai_focus"] = {"focus_entity_ids": unique_ids}


def validate_ai_focus_warnings(blocks: list[AIBlock]) -> list[AITypedWarning]:
    warnings: list[AITypedWarning] = []
    for block in blocks:
        ai_focus = (block.data or {}).get("ai_focus") if isinstance(block.data, dict) else None
        if not isinstance(ai_focus, dict):
            continue
        focus_ids = [str(x) for x in (ai_focus.get("focus_entity_ids") or [])]
        items = (block.data or {}).get("items") or []
        present_ids = {str(item.get("id")) for item in items if isinstance(item, dict) and item.get("id") is not None}
        missing = [x for x in focus_ids if x not in present_ids]
        if missing:
            warnings.append(
                AITypedWarning(
                    code="AI_FOCUS_MISMATCH",
                    message="ai_focus references entities not present in block items.",
                    meta={"missing_entity_ids": missing},
                )
            )
    return warnings


def generate_blocks(
    tool_turns: list[dict],
    *,
    presentation_hints: dict | None = None,
    user_query: str | None = None,
    operation_name: str | None = None,
) -> list[AIBlock]:
    blocks: list[AIBlock] = []
    for turn in tool_turns:
        tool = turn.get("tool")
        params = turn.get("params") or {}
        result = turn.get("result") or {}
        if "error" in result:
            continue

        if tool == "geocode_address":
            blocks.append(
                AIBlock(
                    id=f"block_{uuid4().hex[:8]}",
                    kind="entity_detail",
                    entity_type="address",
                    layout="key_value",
                    data={
                        "formatted_address": result.get("formatted_address"),
                        "address_object": result.get("address_object"),
                    },
                )
            )
            continue

        if tool == "create_order":
            created = ((result.get("result") or {}).get("created") or [])
            order_data = (created[0].get("order") if created and isinstance(created[0], dict) else {}) or {}
            payload = {
                "id": result.get("order_id") or order_data.get("id"),
                "items_created": result.get("items_created", 0),
            }
            payload.update(order_data)
            blocks.append(
                AIBlock(
                    id=f"block_{uuid4().hex[:8]}",
                    kind="entity_detail",
                    entity_type="order",
                    layout="key_value",
                    data=payload,
                )
            )
            continue

        if tool == "list_orders":
            orders = _get_orders(result)
            items = _build_order_items(orders)
            columns = _infer_order_columns(params, user_query, presentation_hints)
            block_data = {"total": _orders_total(result, orders), "items": items}
            ai_focus = _compute_order_ai_focus(items)
            if ai_focus:
                block_data["ai_focus"] = ai_focus
            blocks.append(
                AIBlock(
                    id=f"block_{uuid4().hex[:8]}",
                    kind="entity_collection",
                    entity_type="order",
                    layout="table",
                    data=block_data,
                    meta={"table": {"columns": columns}},
                )
            )
            continue

        if tool == "list_plans":
            plans = _get_plans(result)
            items = [
                {
                    "id": p.get("id"),
                    "plan_name": p.get("label"),
                    "plan_type": p.get("plan_type"),
                    "state": p.get("state_id"),
                    "total_orders": p.get("total_orders"),
                    "reference": f"{p.get('label')} ({p.get('plan_type')} plan)" if p.get("label") and p.get("plan_type") else p.get("label"),
                }
                for p in plans
            ]
            blocks.append(
                AIBlock(
                    id=f"block_{uuid4().hex[:8]}",
                    kind="entity_collection",
                    entity_type="plan",
                    layout="table",
                    data={"total": _plans_total(result, plans), "items": items},
                    meta={"table": {"columns": ["plan_name", "plan_type", "state", "total_orders"]}},
                )
            )
            continue

        if tool == "list_routes":
            routes = _to_list(result.get("routes"))
            items = []
            for route in routes:
                plan_label = ((route.get("route_plan") or {}).get("label") if isinstance(route.get("route_plan"), dict) else None) or "plan"
                items.append(
                    {
                        "id": route.get("id"),
                        "reference": f"Route for {plan_label}",
                        "driver_id": route.get("driver_id"),
                        "is_selected": route.get("is_selected"),
                        "stops": len(route.get("stops") or []),
                    }
                )
            blocks.append(
                AIBlock(
                    id=f"block_{uuid4().hex[:8]}",
                    kind="entity_collection",
                    entity_type="route",
                    layout="table",
                    data={"total": result.get("count") or len(items), "items": items},
                    meta={"table": {"columns": ["reference", "driver_id", "is_selected", "stops"]}},
                )
            )
            continue

        if tool == "create_plan":
            blocks.append(
                AIBlock(
                    id=f"block_{uuid4().hex[:8]}",
                    kind="entity_detail",
                    entity_type="plan",
                    layout="key_value",
                    data={
                        "id": result.get("plan_id"),
                        "label": result.get("label") or params.get("label"),
                        "plan_type": result.get("plan_type"),
                        "start_date": result.get("start_date") or params.get("start_date"),
                        "end_date": result.get("end_date") or params.get("end_date"),
                    },
                )
            )
            continue

        if tool == "assign_orders_to_plan":
            blocks.append(
                AIBlock(
                    id=f"block_{uuid4().hex[:8]}",
                    kind="summary",
                    entity_type="generic",
                    layout="summary",
                    data={"assigned": result.get("assigned"), "plan_id": result.get("plan_id") or params.get("plan_id")},
                )
            )
            continue

        if tool == "update_order_state":
            blocks.append(
                AIBlock(
                    id=f"block_{uuid4().hex[:8]}",
                    kind="summary",
                    entity_type="generic",
                    layout="summary",
                    data={"state": result.get("state"), "count": result.get("count", 0), "order_ids": result.get("order_ids") or params.get("order_ids")},
                )
            )
            continue

        if tool == "update_order":
            blocks.append(
                AIBlock(
                    id=f"block_{uuid4().hex[:8]}",
                    kind="entity_detail",
                    entity_type="order",
                    layout="key_value",
                    data={"order_id": result.get("order_id"), "updated_fields": result.get("updated_fields") or []},
                )
            )
            continue

        if tool == "add_items_to_order":
            blocks.append(
                AIBlock(
                    id=f"block_{uuid4().hex[:8]}",
                    kind="entity_detail",
                    entity_type="order",
                    layout="key_value",
                    data={"order_id": result.get("order_id"), "items_added": result.get("items_added", 0), "result": result.get("result")},
                )
            )
            continue

        if tool == "search_item_types":
            rows = _to_list(result.get("item_types"))
            items = []
            for row in rows:
                article = (row.get("sample_article_number") or "")
                suffix = article[-4:] if len(article) >= 4 else article
                ref = f"{row.get('item_type')} ({suffix})" if suffix else row.get("item_type")
                items.append({"item_type": row.get("item_type"), "reference": ref, "properties_template": row.get("properties_template")})
            blocks.append(
                AIBlock(
                    id=f"block_{uuid4().hex[:8]}",
                    kind="entity_collection",
                    entity_type="item_type",
                    layout="chips",
                    data={"total": result.get("count") or len(items), "items": items},
                )
            )
            continue

        if tool == "optimize_plan":
            blocks.append(
                AIBlock(
                    id=f"block_{uuid4().hex[:8]}",
                    kind="summary",
                    entity_type="generic",
                    layout="summary",
                    data={
                        "plan_id": params.get("route_plan_id") or params.get("plan_id"),
                        "route_id": result.get("route_id"),
                        "total_distance_meters": result.get("total_distance_meters"),
                        "total_travel_time_seconds": result.get("total_travel_time_seconds"),
                    },
                )
            )
            continue

        if tool == "list_item_types_config":
            raw = result.get("item_types")
            if isinstance(raw, dict):
                rows = list((raw.get("byClientId") or {}).values())
            else:
                rows = _to_list(raw)
            blocks.append(
                AIBlock(
                    id=f"block_{uuid4().hex[:8]}",
                    kind="entity_collection",
                    entity_type="item_type",
                    layout="table",
                    data={"total": result.get("count") or len(rows), "items": rows},
                    meta={"table": {"columns": ["name", "properties"]}},
                )
            )
            continue

        if tool == "list_item_properties_config":
            rows = _to_list(result.get("item_properties"))
            blocks.append(
                AIBlock(
                    id=f"block_{uuid4().hex[:8]}",
                    kind="entity_collection",
                    entity_type="item_property",
                    layout="table",
                    data={"total": result.get("count") or len(rows), "items": rows},
                    meta={"table": {"columns": ["name", "field_type", "required"]}},
                )
            )
            continue

        if tool == "get_analytics_snapshot":
            metrics = result.get("metrics") or {}
            trends = _to_list(result.get("trends"))
            breakdowns = _to_list(result.get("breakdowns"))
            blocks.append(
                AIBlock(
                    id=f"block_{uuid4().hex[:8]}",
                    kind="entity_collection",
                    entity_type="analytics_kpi",
                    layout="table",
                    data={"items": [{"name": k, "value": v} for k, v in metrics.items()]},
                )
            )
            blocks.append(
                AIBlock(
                    id=f"block_{uuid4().hex[:8]}",
                    kind="entity_collection",
                    entity_type="analytics_trend",
                    layout="table",
                    data={"items": trends},
                )
            )
            blocks.append(
                AIBlock(
                    id=f"block_{uuid4().hex[:8]}",
                    kind="entity_collection",
                    entity_type="analytics_breakdown",
                    layout="table",
                    data={"items": breakdowns},
                )
            )
            continue

        blocks.append(
            AIBlock(
                id=f"block_{uuid4().hex[:8]}",
                kind="summary",
                entity_type="generic",
                layout="summary",
                data={"tool": tool, "result": result},
            )
        )

    _apply_ai_led_focus(blocks, "", operation_name)
    return blocks



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
        orders = _get_orders(result)
        count = _orders_total(result, orders)
        return f"Found {count} order{'s' if count != 1 else ''}."

    if tool == "list_plans":
        plans = _get_plans(result)
        count = _plans_total(result, plans)
        return f"Found {count} plan{'s' if count != 1 else ''}."

    if tool == "assign_orders_to_plan" or tool == "assign_orders":
        count = result.get("updated") or result.get("count") or 0
        return f"Assigned {count} order{'s' if count != 1 else ''} to plan."

    if tool == "create_plan":
        plan_id = result.get("plan_id")
        return f"Created plan {plan_id}." if plan_id else "Plan created."

    if tool == "optimize_plan":
        return "Route optimization completed."

    if tool == "get_analytics_snapshot":
        total_orders = ((result.get("metrics") or {}).get("total_orders") or 0)
        return f"Analytics snapshot ready for {total_orders} orders."

    if tool == "get_plan_summary":
        plan = result.get("route_plan") or {}
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
            # Keep filtering deterministic and avoid forced navigation.
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
            plan_id = params.get("plan_id") or params.get("route_plan_id")
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


def generate_interactions(tool_turns: list[dict]) -> list[AIInteraction]:
    for turn in tool_turns:
        if "error" in (turn.get("result") or {}):
            return []

    interactions: list[AIInteraction] = []
    for turn in tool_turns:
        tool = turn.get("tool")
        params = turn.get("params") or {}
        result = turn.get("result") or {}

        if tool == "list_plans":
            plans = _get_plans(result)
            plan_types = sorted({p.get("plan_type") for p in plans if p.get("plan_type")})
            if len(plan_types) > 1:
                interactions.append(
                    AIInteraction(
                        id="int_question_plan_type",
                        kind="question",
                        label="Which plan type should I use?",
                        required=True,
                        response_mode="select",
                        options=[{"id": p, "label": p} for p in plan_types],
                    )
                )

        if tool == "list_routes":
            routes = _to_list(result.get("routes"))
            drivers = []
            for route in routes:
                driver_id = route.get("driver_id")
                if driver_id is None:
                    continue
                driver_name = route.get("driver_name") or f"Driver {driver_id}"
                candidate = {"id": str(driver_id), "label": driver_name}
                if candidate not in drivers:
                    drivers.append(candidate)
            if len(drivers) > 1:
                interactions.append(
                    AIInteraction(
                        id="int_question_driver",
                        kind="question",
                        label="Which driver should I focus on?",
                        required=True,
                        response_mode="select",
                        options=drivers,
                    )
                )

        if tool == "update_order_state":
            count = int(result.get("count") or len(params.get("order_ids") or []))
            if count >= 6:
                interactions.append(
                    AIInteraction(
                        id="int_confirm_update_order_state",
                        kind="confirm",
                        label="Confirm bulk order state update",
                        required=True,
                        response_mode="confirm",
                        payload={"target_count": count, "operation": "update_order_state"},
                    )
                )

        if tool == "assign_orders_to_plan":
            batch = len(params.get("order_ids") or [])
            assigned = int(result.get("assigned") or 0)
            if batch >= 50 or assigned >= 50:
                interactions.append(
                    AIInteraction(
                        id="int_confirm_assign_orders",
                        kind="confirm",
                        label="Confirm large plan assignment",
                        required=True,
                        response_mode="confirm",
                        payload={"plan_id": result.get("plan_id") or params.get("plan_id")},
                    )
                )

    return interactions


def _maybe_structure_markdown(content: str, blocks: list[AIBlock], narrative_policy: str | None) -> str:
    if not blocks:
        return content
    if narrative_policy == "full_enumeration":
        return content
    if "###" in content or content.lstrip().startswith("#"):
        return content
    if "\n- " in content:
        return content

    sentences = [s.strip() for s in content.split(".") if s.strip()]
    if len(sentences) < 2:
        return content
    head = sentences[0] + "."
    highlights = [f"- {s}." for s in sentences[1:]]
    if not highlights:
        return f"### Snapshot\n\n{head}"
    return "\n".join(["### Snapshot", "", head, "", "#### Highlights", "", *highlights])


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
    interactions_override: list[AIInteraction] | None = None,
    narrative_policy_override: str | None = None,
    presentation_hints_override: dict | None = None,
    user_query_override: str | None = None,
    operation_name: str | None = None,
) -> AIThreadMessageResponse:
    tool_trace = format_tool_trace(tool_turns)
    actions = generate_actions(tool_turns)
    status_label = "Completed" if success else "Failed"
    data = data or {}

    mapped_blocks: list[AIBlock] = []
    rendering_hints: dict = {}

    if _is_narrative_statistics_response(tool_turns) and data:
        block_types = {blk.get("type") for blk in (data.get("blocks") or []) if isinstance(blk, dict)}
        narrative_source_types = {"text", "analytics_kpi", "analytics_trend", "analytics_breakdown"}
        if block_types and block_types.issubset(narrative_source_types):
            data = _map_narrative_blocks_to_renderable(data)

    if data.get("blocks"):
        mapped_blocks, rendering_hints = _map_data_blocks(data)

    if not mapped_blocks:
        mapped_blocks = generate_blocks(
            tool_turns,
            presentation_hints=presentation_hints_override,
            user_query=user_query_override,
            operation_name=operation_name,
        )

    _apply_ai_led_focus(mapped_blocks, final_message, operation_name)

    if data.get("statistical_output"):
        stat = data.get("statistical_output") or {}
        insights = stat.get("insights") or []
        warnings = stat.get("warnings") or []
        if insights:
            mapped_blocks.append(
                AIBlock(
                    id=f"block_{uuid4().hex[:8]}",
                    kind="analytics",
                    entity_type="analytics_insight",
                    layout="list",
                    data={"items": insights, "confidence_score": stat.get("confidence_score")},
                    meta={"schema_version": 1},
                )
            )
        if warnings:
            mapped_blocks.append(
                AIBlock(
                    id=f"block_{uuid4().hex[:8]}",
                    kind="analytics",
                    entity_type="analytics_warning",
                    layout="list",
                    data={"items": warnings},
                    meta={"schema_version": 1},
                )
            )

    risk_block = _build_risk_brief_block(tool_turns, data.get("insight_depth"))
    if risk_block is not None:
        mapped_blocks = [risk_block, *mapped_blocks]

    typed_warnings = validate_ai_focus_warnings(mapped_blocks)
    for warning in data.get("warnings") or []:
        typed_warnings.append(
            AITypedWarning(
                code="STATISTICS_WARNING",
                message=str(warning),
                meta={"source": "narrative_statistics"},
            )
        )

    intent = data.get("intent") or ("summary_with_blocks" if mapped_blocks else None)
    narrative_policy = narrative_policy_override or data.get("narrative_policy") or ("no_enumeration" if mapped_blocks else None)
    content = _maybe_structure_markdown(final_message, mapped_blocks, narrative_policy)

    if not rendering_hints:
        rendering_hints = {"has_blocks": bool(mapped_blocks)}

    interactions = interactions_override if interactions_override is not None else generate_interactions(tool_turns)

    payload = AIThreadMessagePayload(
        role="assistant",
        content=content,
        status_label=status_label,
        actions=actions,
        tool_trace=tool_trace,
        data=data,
        interactions=interactions,
        blocks=mapped_blocks,
        intent=intent,
        narrative_policy=narrative_policy,
        rendering_hints=rendering_hints,
        typed_warnings=typed_warnings,
    )

    return AIThreadMessageResponse(thread_id=thread_id, message=payload)
