"""Materialize route groups from selected zones for a route plan."""
from __future__ import annotations

from sqlalchemy import func

from Delivery_app_BK.errors import NotFound, ValidationFailed
from Delivery_app_BK.models import Order, OrderZoneAssignment, RouteGroup, RoutePlan, Zone, ZoneTemplate, db
from Delivery_app_BK.services.context import ServiceContext
from Delivery_app_BK.services.queries.route_plan.plan_types.serialize_route_group import (
    serialize_route_group,
)


def _normalize_zone_ids(raw_zone_ids) -> list[int]:
    if not isinstance(raw_zone_ids, list) or not raw_zone_ids:
        raise ValidationFailed("zone_ids must be a non-empty list of integers")

    normalized: list[int] = []
    seen: set[int] = set()
    for index, zone_id in enumerate(raw_zone_ids):
        if isinstance(zone_id, bool) or not isinstance(zone_id, int):
            raise ValidationFailed(f"zone_ids[{index}] must be an integer")
        if zone_id <= 0:
            raise ValidationFailed(f"zone_ids[{index}] must be greater than 0")
        if zone_id in seen:
            continue
        seen.add(zone_id)
        normalized.append(zone_id)
    return normalized


def materialize_route_groups(ctx: ServiceContext) -> list[dict]:
    """Create one route group per selected zone for the provided route plan."""
    route_plan_id = ctx.incoming_data.get("route_plan_id")
    zone_ids = _normalize_zone_ids(ctx.incoming_data.get("zone_ids"))

    if not route_plan_id:
        raise ValidationFailed("route_plan_id is required")

    route_plan = db.session.get(RoutePlan, route_plan_id)
    if route_plan is None or route_plan.team_id != ctx.team_id:
        raise NotFound(f"Route plan {route_plan_id} not found")

    zones = (
        Zone.query.filter(
            Zone.id.in_(zone_ids),
            Zone.team_id == ctx.team_id,
            Zone.is_active.is_(True),
        )
        .order_by(Zone.name.asc())
        .all()
    )
    found_zone_ids = {zone.id for zone in zones}
    missing_zone_ids = [zone_id for zone_id in zone_ids if zone_id not in found_zone_ids]
    if missing_zone_ids:
        raise ValidationFailed(f"Invalid zone_ids for this team: {missing_zone_ids}")

    zone_by_id = {zone.id: zone for zone in zones}
    ordered_zones = [zone_by_id[zone_id] for zone_id in zone_ids]

    created_or_existing: list[RouteGroup] = []
    for zone in ordered_zones:
        existing = RouteGroup.query.filter_by(
            route_plan_id=route_plan_id,
            zone_id=zone.id,
            team_id=ctx.team_id,
        ).first()
        if existing is not None:
            created_or_existing.append(existing)
            continue

        active_template = ZoneTemplate.query.filter_by(
            team_id=ctx.team_id,
            zone_id=zone.id,
            is_active=True,
        ).first()

        route_group = RouteGroup(
            team_id=ctx.team_id,
            client_id=f"route_group:{route_plan_id}:{zone.id}",
            route_plan_id=route_plan_id,
            zone_id=zone.id,
            name=zone.name,
            zone_geometry_snapshot=zone.geometry,
            template_snapshot=(active_template.config_json if active_template else {}),
        )
        db.session.add(route_group)
        created_or_existing.append(route_group)

    orders_per_zone = {
        zone_id: count
        for zone_id, count in (
            db.session.query(OrderZoneAssignment.zone_id, func.count(OrderZoneAssignment.id))
            .join(Order, Order.id == OrderZoneAssignment.order_id)
            .filter(
                Order.team_id == ctx.team_id,
                Order.route_plan_id == route_plan_id,
                OrderZoneAssignment.team_id == ctx.team_id,
                OrderZoneAssignment.is_unassigned.is_(False),
                OrderZoneAssignment.zone_id.in_(zone_ids),
            )
            .group_by(OrderZoneAssignment.zone_id)
            .all()
        )
    }

    for route_group in created_or_existing:
        route_group.total_orders = int(orders_per_zone.get(route_group.zone_id, 0))

    db.session.commit()
    return [serialize_route_group(route_group, ctx) for route_group in created_or_existing]
