from __future__ import annotations
import logging
from collections.abc import Mapping
from typing import Any

from Delivery_app_BK.services.context import ServiceContext
from .tool_registry import TOOLS

logger = logging.getLogger(__name__)


OPERATION_TOOL_ALLOWLIST: dict[str, set[str]] = {
    "list_orders": {"list_orders"},
    "list_plans": {"list_plans"},
    "list_routes": {"list_routes"},
    "create_plan": {"create_plan", "list_orders", "list_plans"},
    "assign_orders_to_plan": {"assign_orders_to_plan", "list_orders", "list_plans"},
}

USER_CONFIG_WRITE_TOOLS = {
    "create_item_type_config",
    "update_item_type_config",
    "create_item_property_config",
    "update_item_property_config",
    "apply_item_taxonomy_proposal",
}


def _apply_execution_facts(tool_name: str, params: dict, ctx: ServiceContext) -> dict:
    if tool_name != "create_order":
        return params

    execution_payload = (ctx.incoming_data or {}).get("_ai_execution") or {}
    normalized_facts = execution_payload.get("normalized_facts") or {}
    if not isinstance(normalized_facts, dict):
        return params

    enriched = dict(params)

    # Prefer explicit planner-provided values. Fill only missing fields.
    if "client_email" not in enriched and normalized_facts.get("client_email"):
        enriched["client_email"] = normalized_facts["client_email"]

    if "client_primary_phone" not in enriched and normalized_facts.get("client_primary_phone"):
        enriched["client_primary_phone"] = normalized_facts["client_primary_phone"]

    return enriched


def _apply_list_orders_clamp(params: dict) -> dict:
    if not isinstance(params, dict):
        return params
    enriched = dict(params)
    limit = enriched.get("limit")
    search_fields = enriched.get("s") or []
    targeted_lookup = bool(enriched.get("q") and "order_scalar_id" in search_fields)
    if targeted_lookup:
        return enriched
    if limit is None or limit < 50:
        enriched["limit"] = 50
    return enriched


def _enforce_user_config_guards(ctx: ServiceContext, tool_name: str, params: dict) -> None:
    route = (ctx.incoming_data or {}).get("_ai_route") or {}
    capability_name = route.get("capability_name")

    if tool_name in USER_CONFIG_WRITE_TOOLS and capability_name != "user_config":
        raise ValueError(f"Tool '{tool_name}' blocked outside user_config capability")

    if tool_name == "apply_item_taxonomy_proposal":
        execution = (ctx.incoming_data or {}).get("_ai_execution") or {}
        if execution.get("confirm_accepted") is not True:
            raise ValueError("apply_item_taxonomy_proposal requires confirm_accepted=true")


def _enforce_operation_allowlist(ctx: ServiceContext, tool_name: str) -> None:
    operation = getattr(ctx, "ai_operation", None)
    if not operation:
        return
    allowed = OPERATION_TOOL_ALLOWLIST.get(operation)
    if not allowed:
        return
    if tool_name not in allowed:
        raise ValueError(f"Tool '{tool_name}' not permitted for operation '{operation}'")


def execute_tool(
    ctx: ServiceContext,
    tool_name: str,
    params: dict,
    *,
    allowed_tools: Mapping[str, Any] | None = None,
) -> dict:
    registry = allowed_tools or TOOLS
    if tool_name not in registry:
        raise ValueError(f"Tool '{tool_name}' is not registered. Allowed: {list(registry.keys())}")

    tool_fn = registry[tool_name]
    _enforce_operation_allowlist(ctx, tool_name)
    _enforce_user_config_guards(ctx, tool_name, params)

    effective_params = _apply_execution_facts(tool_name, params, ctx)
    if tool_name == "list_orders":
        effective_params = _apply_list_orders_clamp(effective_params)
    logger.info("Executing tool | tool=%s | params=%s", tool_name, params)

    result = tool_fn(ctx, **effective_params)

    # Ensure result is always a dict
    if not isinstance(result, dict):
        result = {"result": result}

    return result
