from __future__ import annotations
import logging

from Delivery_app_BK.services.context import ServiceContext
from .tool_registry import TOOLS

logger = logging.getLogger(__name__)


def execute_tool(ctx: ServiceContext, tool_name: str, params: dict) -> dict:
    if tool_name not in TOOLS:
        raise ValueError(f"Tool '{tool_name}' is not registered. Allowed: {list(TOOLS.keys())}")

    tool_fn = TOOLS[tool_name]
    logger.info("Executing tool | tool=%s | params=%s", tool_name, params)

    result = tool_fn(ctx, **params)

    # Ensure result is always a dict
    if not isinstance(result, dict):
        result = {"result": result}

    return result
