"""Create or replace the active template for a zone."""
from __future__ import annotations

from Delivery_app_BK.errors import NotFound, ValidationFailed
from Delivery_app_BK.models import Zone, ZoneTemplate, db
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


def create_zone_template(ctx: ServiceContext) -> dict:
    """Upsert the active template for a zone by creating a new template version."""
    zone_id = ctx.incoming_data.get("zone_id")
    version_id = ctx.incoming_data.get("version_id")
    name = ctx.incoming_data.get("name")
    config_json = ctx.incoming_data.get("config_json") or {}

    if not zone_id:
        raise ValidationFailed("zone_id is required")
    if not name:
        raise ValidationFailed("name is required")
    if not isinstance(config_json, dict):
        raise ValidationFailed("config_json must be an object")

    zone = db.session.get(Zone, zone_id)
    if zone is None or zone.team_id != ctx.team_id:
        raise NotFound(f"Zone {zone_id} not found")
    if version_id is not None and zone.zone_version_id != version_id:
        raise ValidationFailed(f"Zone {zone_id} does not belong to version {version_id}")

    current_active = ZoneTemplate.query.filter_by(
        team_id=ctx.team_id,
        zone_id=zone_id,
        is_active=True,
    ).all()
    for template in current_active:
        template.is_active = False

    latest = (
        ZoneTemplate.query.filter_by(team_id=ctx.team_id, zone_id=zone_id)
        .order_by(ZoneTemplate.version.desc())
        .first()
    )
    next_version = (latest.version + 1) if latest else 1

    created = ZoneTemplate(
        team_id=ctx.team_id,
        zone_id=zone_id,
        name=name,
        config_json=config_json,
        version=next_version,
        is_active=True,
    )
    db.session.add(created)
    db.session.commit()

    return _serialize_zone_template(created)
