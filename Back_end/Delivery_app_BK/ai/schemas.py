from __future__ import annotations
from typing import Optional, Dict, Any, List
from pydantic import BaseModel


class ToolCall(BaseModel):
    tool: str
    parameters: Dict[str, Any] = {}


class PlannerStep(BaseModel):
    type: str  # "tool" | "final"
    tool: Optional[str] = None
    parameters: Optional[Dict[str, Any]] = None
    message: Optional[str] = None


class PlannerState(BaseModel):
    steps: List[Dict[str, Any]] = []


class AIResponse(BaseModel):
    success: bool
    message: str
    data: Optional[Dict[str, Any]] = None
    steps: List[Dict[str, Any]] = []
