from __future__ import annotations

from typing import Any, Dict, List, Literal, Optional, Union

from pydantic import BaseModel, Field, ValidationError


# ---------------------------------------------------------------------------
# V1 schemas (kept for backward compat)
# ---------------------------------------------------------------------------

class ToolCall(BaseModel):
    tool: str
    parameters: Dict[str, Any] = Field(default_factory=dict)


class PlannerStep(BaseModel):
    type: str  # "tool" | "final"
    tool: Optional[str] = None
    parameters: Optional[Dict[str, Any]] = None
    message: Optional[str] = None


class PlannerState(BaseModel):
    steps: List[Dict[str, Any]] = Field(default_factory=list)


class AIResponse(BaseModel):
    success: bool
    message: str
    data: Optional[Dict[str, Any]] = None
    steps: List[Dict[str, Any]] = Field(default_factory=list)


class AIInteractionField(BaseModel):
    id: str
    label: str
    type: str
    required: bool = False
    options: Optional[List[Dict[str, Any]]] = None
    placeholder: Optional[str] = None

    def __getitem__(self, key: str) -> Any:
        return getattr(self, key)


class AIInteractionOption(BaseModel):
    id: str
    label: str
    description: Optional[str] = None

    def __getitem__(self, key: str) -> Any:
        return getattr(self, key)


class AIInteraction(BaseModel):
    id: str
    kind: str
    label: str
    required: bool = True
    response_mode: str = "form"
    payload: Dict[str, Any] = Field(default_factory=dict)
    fields: List[AIInteractionField] = Field(default_factory=list)
    options: List[AIInteractionOption] = Field(default_factory=list)
    hint: Optional[str] = None


class AIBlock(BaseModel):
    id: str
    kind: str
    entity_type: str = "generic"
    layout: str = "summary"
    title: Optional[str] = None
    subtitle: Optional[str] = None
    data: Dict[str, Any] = Field(default_factory=dict)
    meta: Dict[str, Any] = Field(default_factory=dict)


class AITypedWarning(BaseModel):
    code: str
    message: str
    meta: Dict[str, Any] = Field(default_factory=dict)


class PlannerIntentStep(BaseModel):
    type: Literal["intent"]
    operation: Optional[str] = None
    needs_clarification: bool = False
    reason: Optional[str] = None


class PlannerClarifyStep(BaseModel):
    type: Literal["clarify"]
    message: str
    interaction: AIInteraction


class PlannerToolStep(BaseModel):
    type: Literal["tool"]
    tool: str
    parameters: Dict[str, Any] = Field(default_factory=dict)


class PresentationBlockHint(BaseModel):
    entity_type: str
    columns: List[str] = Field(default_factory=list)


class PresentationHints(BaseModel):
    blocks: List[PresentationBlockHint] = Field(default_factory=list)


class PlannerFinalStep(BaseModel):
    type: Literal["final"]
    message: str
    presentation_hints: Optional[PresentationHints] = None


class PlannerProceedStep(BaseModel):
    type: Literal["proceed"]
    message: Optional[str] = None


PlannerStepTyped = Union[
    PlannerIntentStep,
    PlannerClarifyStep,
    PlannerToolStep,
    PlannerFinalStep,
    PlannerProceedStep,
]


def parse_planner_step(payload: Any) -> PlannerStepTyped:
    if isinstance(
        payload,
        (PlannerIntentStep, PlannerClarifyStep, PlannerToolStep, PlannerFinalStep, PlannerProceedStep),
    ):
        return payload
    if not isinstance(payload, dict):
        raise ValidationError.from_exception_data("PlannerStep", [])

    step_type = payload.get("type")
    if step_type == "intent":
        return PlannerIntentStep(**payload)
    if step_type == "clarify":
        return PlannerClarifyStep(**payload)
    if step_type == "tool":
        return PlannerToolStep(**payload)
    if step_type == "final":
        return PlannerFinalStep(**payload)
    if step_type == "proceed":
        return PlannerProceedStep(**payload)
    raise ValidationError.from_exception_data("PlannerStep", [])


# ---------------------------------------------------------------------------
# V2 thread schemas
# ---------------------------------------------------------------------------

class AIAction(BaseModel):
    id: Optional[str] = None
    type: str                          # navigate | apply_order_filters | copy_text | open_settings
    label: str
    payload: Optional[Dict[str, Any]] = None
    hint: Optional[str] = None
    disabled: Optional[bool] = None


class AIToolTraceEntry(BaseModel):
    id: str
    tool: str
    status: str                        # "success" | "error"
    summary: str
    params: Dict[str, Any] = Field(default_factory=dict)
    result: Dict[str, Any] = Field(default_factory=dict)


class AIThreadTurn(BaseModel):
    id: str
    thread_id: str
    role: str                          # "user" | "assistant" | "tool"
    content: str
    created_at: str                    # ISO-8601

    tool_name: Optional[str] = None
    tool_params: Optional[Dict[str, Any]] = None
    tool_result: Optional[Dict[str, Any]] = None

    actions: Optional[List[AIAction]] = None
    tool_trace: Optional[List[AIToolTraceEntry]] = None
    data: Optional[Dict[str, Any]] = None
    status_label: Optional[str] = None
    awaiting_response: Optional[bool] = None
    interaction_kind: Optional[str] = None
    interaction_id: Optional[str] = None
    interaction_response_id: Optional[str] = None
    interaction_form: Optional[Dict[str, Any]] = None


class AIThreadMetadata(BaseModel):
    thread_id: str
    user_id: int
    app_scope: str
    session_scope_id: Optional[str] = None
    current_workspace: Optional[str] = None
    created_at: str
    updated_at: str


# ---------------------------------------------------------------------------
# Route DTOs
# ---------------------------------------------------------------------------

class AIThreadCreateResponse(BaseModel):
    thread_id: str


class AIThreadMessageRequest(BaseModel):
    message: str
    context: Optional[Dict[str, Any]] = None


class AIThreadMessagePayload(BaseModel):
    role: str
    content: str
    status_label: Optional[str] = None
    actions: List[AIAction] = Field(default_factory=list)
    tool_trace: List[AIToolTraceEntry] = Field(default_factory=list)
    data: Optional[Dict[str, Any]] = None
    interactions: List[AIInteraction] = Field(default_factory=list)
    blocks: List[AIBlock] = Field(default_factory=list)
    intent: Optional[str] = None
    narrative_policy: Optional[str] = None
    rendering_hints: Dict[str, Any] = Field(default_factory=dict)
    typed_warnings: List[AITypedWarning] = Field(default_factory=list)


class AIThreadMessageResponse(BaseModel):
    thread_id: str
    message: AIThreadMessagePayload


class AIThreadGetResponse(BaseModel):
    thread_id: str
    messages: List[AIThreadTurn] = Field(default_factory=list)

