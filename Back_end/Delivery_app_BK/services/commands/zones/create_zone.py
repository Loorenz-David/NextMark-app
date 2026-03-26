"""Create a new Zone record within a ZoneVersion."""
from __future__ import annotations

from Delivery_app_BK.errors import NotFound, ValidationFailed
from Delivery_app_BK.models import db
from Delivery_app_BK.models.tables.zones.zone import Zone
from Delivery_app_BK.models.tables.zones.zone_version import ZoneVersion
from Delivery_app_BK.services.context import ServiceContext

_VALID_ZONE_TYPES = frozenset({"bootstrap", "system", "user"})


def _serialize_zone(z: Zone) -> dict:
    return {
        "id": z.id,
        "team_id": z.team_id,
        "zone_version_id": z.zone_version_id,
        "city_key": z.city_key,
        "name": z.name,
        "zone_type": z.zone_type,
        "centroid_lat": z.centroid_lat,
        "centroid_lng": z.centroid_lng,
        "geometry": z.geometry,
        "min_lat": z.min_lat,
        "max_lat": z.max_lat,
        "min_lng": z.min_lng,
        "max_lng": z.max_lng,
        "is_active": z.is_active,
        "created_at": z.created_at.isoformat() if z.created_at else None,
    }


def create_zone(ctx: ServiceContext) -> dict:
    """Create a new Zone record under the specified zone version."""
    version_id = ctx.incoming_data.get("version_id")
    name = ctx.incoming_data.get("name")
    zone_type = ctx.incoming_data.get("zone_type", "user")

    if not version_id:
        raise ValidationFailed("version_id is required")
    if not name:
        raise ValidationFailed("name is required")
    if zone_type not in _VALID_ZONE_TYPES:
        raise ValidationFailed(f"zone_type must be one of {sorted(_VALID_ZONE_TYPES)}")

    version = db.session.get(ZoneVersion, version_id)
    if version is None or version.team_id != ctx.team_id:
        raise NotFound(f"Zone version {version_id} not found")

    zone = Zone(
        team_id=ctx.team_id,
        zone_version_id=version_id,
        city_key=version.city_key,
        name=name,
        zone_type=zone_type,
        centroid_lat=ctx.incoming_data.get("centroid_lat"),
        centroid_lng=ctx.incoming_data.get("centroid_lng"),
        geometry=ctx.incoming_data.get("geometry"),
        min_lat=ctx.incoming_data.get("min_lat"),
        max_lat=ctx.incoming_data.get("max_lat"),
        min_lng=ctx.incoming_data.get("min_lng"),
        max_lng=ctx.incoming_data.get("max_lng"),
        is_active=True,
    )
    db.session.add(zone)
    db.session.commit()
    return _serialize_zone(zone)
