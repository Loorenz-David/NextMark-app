from __future__ import annotations
from typing import Any, Literal
from pydantic import BaseModel

class AIAction(BaseModel):
    id: str | None = None
    type: str  # navigate | apply_order_filters | copy_text | open_settings
    label: str
    payload: dict[str, Any] | None = None
    hint: str | None = None
    disabled: bool | None = None


class AIToolTraceEntry(BaseModel):
    id: str
    tool: str
    status: str  # "success" | "error"
    summary: str
    params: dict[str, Any] = {}
    result: dict[str, Any] = {}


class AIThreadTurn(BaseModel):
    id: str
    thread_id: str
    role: str  # "user" | "assistant" | "tool"
    content: str
    created_at: str  # ISO-8601

    tool_name: str | None = None
    tool_params: dict[str, Any] | None = None
    tool_result: dict[str, Any] | None = None

    actions: list[AIAction] | None = None
    tool_trace: list[AIToolTraceEntry] | None = None
    data: dict[str, Any] | None = None
    status_label: str | None = None


class AIThreadMetadata(BaseModel):
    thread_id: str
    user_id: int
    app_scope: str
    session_scope_id: str | None = None
    current_workspace: str | None = None
    created_at: str
    updated_at: str


class AIThreadCreateResponse(BaseModel):
    thread_id: str


class AIThreadMessageRequest(BaseModel):
    message: str
    context: dict[str, Any] | None = None


class NarrativeBlock(BaseModel):
    """
    A single structured output block returned by a narrative tool.
    The frontend renders each block type differently.
    """

    type: Literal[
        "text",               # plain narrative paragraph
        "stat_kpi",           # single metric with label + value + optional delta
        "stat_trend",         # time-series sparkline values
        "stat_breakdown",     # categorical distribution (e.g. order states by zone)
        "insight",            # synthesized finding - bold callout
        "warning",            # risk or anomaly - flagged visually
        "recommendation",     # suggested action with optional action_id
    ]
    label: str | None = None
    value: Any = None  # str, int, float, list, dict - depends on type
    meta: dict | None = None  # rendering hints (unit, format, color_hint, etc.)


class AIThreadMessagePayload(BaseModel):
    role: str
    content: str
    status_label: str
    actions: list[AIAction]
    tool_trace: list[AIToolTraceEntry]
    blocks: list[NarrativeBlock] | None = None
    data: dict | None = None


class AIThreadMessageResponse(BaseModel):
    success: bool
    data: dict[str, Any]


class AIThreadGetResponse(BaseModel):
    thread_id: str
    messages: list[AIThreadTurn] = []

