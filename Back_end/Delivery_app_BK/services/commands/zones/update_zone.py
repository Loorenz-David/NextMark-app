"""Update name and/or geometry for a zone in an inactive version."""
from __future__ import annotations

from Delivery_app_BK.errors import NotFound, ValidationFailed
from Delivery_app_BK.models import Zone, ZoneVersion, db
from Delivery_app_BK.services.context import ServiceContext
from Delivery_app_BK.zones.services.postgis_geometry import refresh_zone_geometry_derivatives


def _serialize_zone(zone: Zone) -> dict:
    return {
        "id": zone.id,
        "team_id": zone.team_id,
        "zone_version_id": zone.zone_version_id,
        "city_key": zone.city_key,
        "name": zone.name,
        "zone_type": zone.zone_type,
        "centroid_lat": zone.centroid_lat,
        "centroid_lng": zone.centroid_lng,
        "geometry": zone.geometry,
        "min_lat": zone.min_lat,
        "max_lat": zone.max_lat,
        "min_lng": zone.min_lng,
        "max_lng": zone.max_lng,
        "is_active": zone.is_active,
        "created_at": zone.created_at.isoformat() if zone.created_at else None,
        "template": None,
    }


def update_zone(ctx: ServiceContext) -> dict:
    zone_id = ctx.incoming_data.get("zone_id")
    version_id = ctx.incoming_data.get("version_id")

    if not zone_id:
        raise ValidationFailed("zone_id is required")

    zone = db.session.get(Zone, zone_id)
    if zone is None or zone.team_id != ctx.team_id:
        raise NotFound(f"Zone {zone_id} not found")

    if version_id is not None and zone.zone_version_id != version_id:
        raise NotFound(f"Zone {zone_id} not found")

    version = db.session.get(ZoneVersion, zone.zone_version_id)
    if version is None or version.team_id != ctx.team_id:
        raise NotFound(f"Zone version for zone {zone_id} not found")

    if version.is_active:
        raise ValidationFailed("Cannot edit zones in an active version. Create a new version instead.")

    allowed_fields = {
        "name",
        "geometry",
        "centroid_lat",
        "centroid_lng",
        "min_lat",
        "max_lat",
        "min_lng",
        "max_lng",
    }

    geometry_updated = False

    for field in allowed_fields:
        if field not in ctx.incoming_data:
            continue
        value = ctx.incoming_data.get(field)
        if field == "name":
            if value is None or not isinstance(value, str) or not value.strip():
                raise ValidationFailed("name must be a non-empty string")
            value = value.strip()
        if field == "geometry":
            geometry_updated = True
        setattr(zone, field, value)

    if geometry_updated:
        db.session.flush()
        refresh_zone_geometry_derivatives(zone.id)

    db.session.commit()
    return _serialize_zone(zone)
