from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, Field


class StatisticalMetric(BaseModel):
    name: str
    value: float
    delta: float | None = None


class StatisticalInsight(BaseModel):
    type: Literal["trend", "anomaly", "correlation"]
    description: str
    confidence: float


class StatisticalOutput(BaseModel):
    summary: str
    key_metrics: list[StatisticalMetric] = Field(default_factory=list)
    insights: list[StatisticalInsight] = Field(default_factory=list)
    warnings: list[str] | None = None
    confidence_score: float
