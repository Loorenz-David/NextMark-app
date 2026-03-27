"""Query the active template for a zone."""
from __future__ import annotations

from Delivery_app_BK.models import Zone, ZoneTemplate
from Delivery_app_BK.services.context import ServiceContext


def _serialize_zone_template(template: ZoneTemplate) -> dict:
    return {
        "id": template.id,
        "team_id": template.team_id,
        "zone_id": template.zone_id,
        "name": template.name,
        "config_json": template.config_json,
        "version": template.version,
        "is_active": template.is_active,
        "created_at": template.created_at.isoformat() if template.created_at else None,
        "updated_at": template.updated_at.isoformat() if template.updated_at else None,
    }


def get_zone_template(ctx: ServiceContext) -> dict | None:
    """Return the active zone template for the team and zone, or None."""
    zone_id = ctx.query_params.get("zone_id")
    version_id = ctx.query_params.get("version_id")
    if zone_id is None:
        zone_id = ctx.incoming_data.get("zone_id")
        version_id = ctx.incoming_data.get("version_id")

    if not zone_id:
        return None

    if version_id is not None:
        zone = Zone.query.filter_by(
            id=zone_id,
            zone_version_id=version_id,
            team_id=ctx.team_id,
        ).first()
        if zone is None:
            return None

    template = ZoneTemplate.query.filter_by(
        team_id=ctx.team_id,
        zone_id=zone_id,
        is_active=True,
    ).first()
    return _serialize_zone_template(template) if template else None
