from __future__ import annotations

from Delivery_app_BK.services.context import ServiceContext
from .tool_registry import TOOLS

def execute_tool(ctx: ServiceContext, tool_name: str, params: dict) -> dict:
    if tool_name not in TOOLS:
        raise ValueError(f"Unknown tool: {tool_name!r}")
    fn = TOOLS[tool_name]
    result = fn(ctx, **params)
    if not isinstance(result, dict):
        result = {"result": result}
    return result
