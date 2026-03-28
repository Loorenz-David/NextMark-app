from __future__ import annotations

from collections.abc import Mapping


def _normalize_name(value: object) -> str | None:
    if not isinstance(value, str):
        return None
    normalized = value.strip()
    return normalized or None


def build_route_group_zone_snapshot(*, zone_name: object, geometry: object) -> dict:
    return {
        "name": _normalize_name(zone_name),
        "geometry": geometry,
    }


def normalize_route_group_zone_snapshot(raw_snapshot: object) -> dict:
    if not isinstance(raw_snapshot, Mapping):
        return {
            "name": None,
            "geometry": None,
        }

    return {
        "name": _normalize_name(raw_snapshot.get("name")),
        "geometry": raw_snapshot.get("geometry"),
    }


def route_group_snapshot_geometry(raw_snapshot: object) -> object:
    return normalize_route_group_zone_snapshot(raw_snapshot).get("geometry")


def route_group_snapshot_name(raw_snapshot: object) -> str | None:
    return normalize_route_group_zone_snapshot(raw_snapshot).get("name")
