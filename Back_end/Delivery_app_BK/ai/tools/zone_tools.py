"""
Zone-domain tools.
Implements: list_zones, get_zone_snapshot.

Status: SKELETON - implementations added in Phase 2.
"""
from __future__ import annotations

from Delivery_app_BK.services.context import ServiceContext


def list_zones_tool(ctx: ServiceContext, city_key: str | None = None) -> dict:
    raise NotImplementedError("list_zones_tool - Phase 2")


def get_zone_snapshot_tool(ctx: ServiceContext, zone_id: int, date: str | None = None) -> dict:
    raise NotImplementedError("get_zone_snapshot_tool - Phase 2")
