"""List zones belonging to a zone version."""
from __future__ import annotations

from Delivery_app_BK.errors import NotFound
from Delivery_app_BK.models.tables.zones.zone import Zone
from Delivery_app_BK.models.tables.zones.zone_version import ZoneVersion
from Delivery_app_BK.services.context import ServiceContext


def list_zones_for_version(ctx: ServiceContext) -> list[dict]:
    """Return all zones for a version that belongs to the authenticated team."""
    version_id = ctx.query_params.get("version_id")

    version = ZoneVersion.query.filter_by(id=version_id, team_id=ctx.team_id).first()
    if version is None:
        raise NotFound(f"Zone version {version_id} not found")

    zones = Zone.query.filter_by(zone_version_id=version_id).order_by(Zone.name).all()
    return [
        {
            "id": z.id,
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
        for z in zones
    ]
