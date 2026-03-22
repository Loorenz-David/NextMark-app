from __future__ import annotations

import logging

from Delivery_app_BK.services.analytics.get_breakdowns import get_breakdowns
from Delivery_app_BK.services.analytics.get_metrics import get_metrics
from Delivery_app_BK.services.analytics.get_trends import get_trends
from Delivery_app_BK.services.context import ServiceContext


logger = logging.getLogger(__name__)


def get_analytics_snapshot(ctx: ServiceContext, timeframe: str = "7d") -> dict:
    """Read-only analytics snapshot used by the statistics capability."""
    normalized_timeframe = (timeframe or "7d").strip().lower()
    if normalized_timeframe == "last_7_days":
        normalized_timeframe = "7d"

    metrics = get_metrics(ctx, normalized_timeframe)
    trends_payload = get_trends(ctx, normalized_timeframe)
    breakdowns_payload = get_breakdowns(ctx, normalized_timeframe)

    statuses = [
        metrics.get("data_status") or {},
        trends_payload.get("data_status") or {},
        breakdowns_payload.get("data_status") or {},
    ]
    is_complete = all(status.get("is_complete", True) for status in statuses)
    warnings = [status.get("warning") for status in statuses if status.get("warning")]

    logger.info(
        "Analytics snapshot prepared | timeframe=%s | is_complete=%s | warning_count=%d",
        normalized_timeframe,
        is_complete,
        len(warnings),
    )

    return {
        "metrics": metrics,
        "trends": trends_payload.get("items") or [],
        "breakdowns": breakdowns_payload.get("items") or [],
        "data_status": {
            "is_complete": is_complete,
            "warnings": warnings,
            "components": statuses,
        },
    }
