"""
Item types and properties test data generator.
"""

from __future__ import annotations

from datetime import datetime, timezone
from typing import Any

from Delivery_app_BK.errors import ValidationFailed
from Delivery_app_BK.models import ItemProperty, ItemType, db
from Delivery_app_BK.services.commands.item.create.create_item_property import (
    create_item_property,
)
from Delivery_app_BK.services.commands.item.create.create_item_type import (
    create_item_type,
)
from Delivery_app_BK.services.context import ServiceContext

from .config import (
    build_default_item_properties,
    build_default_item_types,
)


def generate_item_types_test_data(ctx: ServiceContext) -> dict[str, Any]:
    """Create default item properties and types for test data with proper linking."""
    incoming_data = ctx.incoming_data if isinstance(ctx.incoming_data, dict) else {}
    overrides_properties = _parse_item_properties_overrides(
        incoming_data.get("item_properties")
    )
    overrides_types = _parse_item_types_overrides(incoming_data.get("item_types"))

    # Build property and type lists
    property_defaults = build_default_item_properties()
    type_defaults = build_default_item_types()

    # Apply overrides
    property_defaults.extend(overrides_properties)
    type_defaults.extend(overrides_types)

    # Step 1: Create item properties
    property_result = _create_item_properties(ctx, property_defaults)
    created_properties = property_result.get("created", [])
    property_count = len(created_properties)

    if not created_properties:
        return {
            "created_properties": [],
            "created_types": [],
            "properties_count": 0,
            "types_count": 0,
            "warnings": [
                "No item properties created."
            ] + property_result.get("warnings", []),
        }

    # Step 2: Map property names to IDs for linking
    property_by_name = {prop["name"]: prop["id"] for prop in created_properties}

    # Step 3: Create item types with property linkage
    type_result = _create_item_types(ctx, type_defaults, property_by_name)
    created_types = type_result.get("created", [])
    type_count = len(created_types)

    return {
        "created_properties": created_properties,
        "created_types": created_types,
        "properties_count": property_count,
        "types_count": type_count,
        "property_type_links": len(
            [
                1
                for type_obj in created_types
                for _ in type_obj.get("properties", [])
            ]
        ),
        "warnings": property_result.get("warnings", [])
        + type_result.get("warnings", []),
    }


def _create_item_properties(
    ctx: ServiceContext, property_defaults: list[dict]
) -> dict[str, Any]:
    """Create missing item properties and return all resolved properties.

    This function is idempotent for repeated runs in the same team: it reuses
    existing properties with the same name and only creates missing ones.
    """
    if not property_defaults:
        return {"created": [], "warnings": []}

    team_id = ctx.team_id
    names = [
        item.get("name")
        for item in property_defaults
        if isinstance(item, dict) and item.get("name")
    ]

    existing_by_name = _load_item_properties_by_name(team_id, names)
    missing_defaults = [
        item
        for item in property_defaults
        if item.get("name") and item.get("name") not in existing_by_name
    ]

    created_result: dict[str, Any] = {"created": []}

    if missing_defaults:
        property_ctx = ServiceContext(
            incoming_data={"fields": missing_defaults},
            identity=ctx.identity,
            query_params=ctx.query_params,
            incoming_file=ctx.incoming_file,
            check_team_id=ctx.check_team_id,
            inject_team_id=ctx.inject_team_id,
            skip_id_instance_injection=ctx.skip_id_instance_injection,
            relationship_map=ctx.relationship_map,
            on_create_return=ctx.on_create_return,
            on_query_return=ctx.on_query_return,
            allow_is_system_modification=ctx.allow_is_system_modification,
            extract_fields_key=True,
            prevent_event_bus=ctx.prevent_event_bus,
        )
        created_result = create_item_property(property_ctx)
    else:
        property_ctx = ServiceContext(
            incoming_data={},
            identity=ctx.identity,
            query_params=ctx.query_params,
            incoming_file=ctx.incoming_file,
            check_team_id=ctx.check_team_id,
            inject_team_id=ctx.inject_team_id,
            skip_id_instance_injection=ctx.skip_id_instance_injection,
            relationship_map=ctx.relationship_map,
            on_create_return=ctx.on_create_return,
            on_query_return=ctx.on_query_return,
            allow_is_system_modification=ctx.allow_is_system_modification,
            extract_fields_key=True,
            prevent_event_bus=ctx.prevent_event_bus,
        )

    resolved_by_name = _load_item_properties_by_name(team_id, names)
    resolved_rows = [
        {
            "id": row.id,
            "name": row.name,
            "field_type": row.field_type,
        }
        for row in resolved_by_name.values()
    ]
    if not resolved_rows:
        resolved_rows = created_result.get("created", [])

    return {
        "created": resolved_rows,
        "warnings": property_ctx.warnings,
        "newly_created": created_result.get("created", []),
    }


def _create_item_types(
    ctx: ServiceContext,
    type_defaults: list[dict],
    property_by_name: dict[str, int],
) -> dict[str, Any]:
    """Create missing item types, ensure property links, and return all types.

    This function is idempotent for repeated runs in the same team.
    """
    if not type_defaults:
        return {"created": [], "warnings": []}

    team_id = ctx.team_id

    # Build desired type fields with property IDs linked
    desired_by_name: dict[str, dict[str, Any]] = {}
    for type_def in type_defaults:
        type_name = type_def.get("name")
        if not type_name:
            continue

        field = {
            "name": type_name,
        }

        # Link properties by resolving names to IDs
        property_names = type_def.get("property_names", [])
        property_ids = [
            property_by_name[prop_name]
            for prop_name in property_names
            if prop_name in property_by_name
        ]

        if property_ids:
            field["properties"] = property_ids

        desired_by_name[type_name] = field

    names = list(desired_by_name.keys())
    existing_by_name = _load_item_types_by_name(team_id, names)
    missing_fields = [
        desired_by_name[name] for name in names if name not in existing_by_name
    ]

    created_result: dict[str, Any] = {"created": []}

    if missing_fields:
        type_ctx = ServiceContext(
            incoming_data={"fields": missing_fields},
            identity=ctx.identity,
            query_params=ctx.query_params,
            incoming_file=ctx.incoming_file,
            check_team_id=ctx.check_team_id,
            inject_team_id=ctx.inject_team_id,
            skip_id_instance_injection=ctx.skip_id_instance_injection,
            relationship_map=ctx.relationship_map,
            on_create_return=ctx.on_create_return,
            on_query_return=ctx.on_query_return,
            allow_is_system_modification=ctx.allow_is_system_modification,
            extract_fields_key=True,
            prevent_event_bus=ctx.prevent_event_bus,
        )
        created_result = create_item_type(type_ctx)
    else:
        type_ctx = ServiceContext(
            incoming_data={},
            identity=ctx.identity,
            query_params=ctx.query_params,
            incoming_file=ctx.incoming_file,
            check_team_id=ctx.check_team_id,
            inject_team_id=ctx.inject_team_id,
            skip_id_instance_injection=ctx.skip_id_instance_injection,
            relationship_map=ctx.relationship_map,
            on_create_return=ctx.on_create_return,
            on_query_return=ctx.on_query_return,
            allow_is_system_modification=ctx.allow_is_system_modification,
            extract_fields_key=True,
            prevent_event_bus=ctx.prevent_event_bus,
        )

    # Ensure existing types have all desired properties linked.
    property_by_id = _load_item_properties_by_id(team_id, list(property_by_name.values()))
    type_rows = _load_item_types_by_name(team_id, names)
    for type_name, type_row in type_rows.items():
        desired_property_ids = desired_by_name.get(type_name, {}).get("properties", [])
        current_ids = {prop.id for prop in type_row.properties}
        for prop_id in desired_property_ids:
            if prop_id in current_ids:
                continue
            prop_row = property_by_id.get(prop_id)
            if prop_row is None:
                continue
            type_row.properties.append(prop_row)

    if type_rows:
        db.session.flush()

    resolved_rows = _load_item_types_by_name(team_id, names)
    created_rows = [
        {
            "id": row.id,
            "name": row.name,
            "properties": [prop.id for prop in row.properties],
        }
        for row in resolved_rows.values()
    ]
    if not created_rows:
        created_rows = created_result.get("created", [])
    return {
        "created": created_rows,
        "warnings": type_ctx.warnings,
    }


def _load_item_properties_by_name(team_id: int | None, names: list[str]) -> dict[str, ItemProperty]:
    if not team_id or not names:
        return {}
    try:
        rows = (
            db.session.query(ItemProperty)
            .filter(ItemProperty.team_id == team_id)
            .filter(ItemProperty.name.in_(names))
            .all()
        )
    except RuntimeError:
        return {}
    return {row.name: row for row in rows}


def _load_item_properties_by_id(team_id: int | None, ids: list[int]) -> dict[int, ItemProperty]:
    if not team_id or not ids:
        return {}
    try:
        rows = (
            db.session.query(ItemProperty)
            .filter(ItemProperty.team_id == team_id)
            .filter(ItemProperty.id.in_(ids))
            .all()
        )
    except RuntimeError:
        return {}
    return {row.id: row for row in rows}


def _load_item_types_by_name(team_id: int | None, names: list[str]) -> dict[str, ItemType]:
    if not team_id or not names:
        return {}
    try:
        rows = (
            db.session.query(ItemType)
            .filter(ItemType.team_id == team_id)
            .filter(ItemType.name.in_(names))
            .all()
        )
    except RuntimeError:
        return {}
    return {row.name: row for row in rows}


def _parse_item_properties_overrides(value: Any) -> list[dict]:
    """Parse and validate item property overrides."""
    if value is None:
        return []
    if not isinstance(value, list):
        raise ValidationFailed("item_properties must be a list.")

    parsed_properties: list[dict] = []
    for index, prop in enumerate(value):
        if not isinstance(prop, dict):
            raise ValidationFailed(f"item_properties[{index}] must be an object.")
        parsed_properties.append(prop)

    return parsed_properties


def _parse_item_types_overrides(value: Any) -> list[dict]:
    """Parse and validate item type overrides."""
    if value is None:
        return []
    if not isinstance(value, list):
        raise ValidationFailed("item_types must be a list.")

    parsed_types: list[dict] = []
    for index, item_type in enumerate(value):
        if not isinstance(item_type, dict):
            raise ValidationFailed(f"item_types[{index}] must be an object.")
        parsed_types.append(item_type)

    return parsed_types


__all__ = [
    "generate_item_types_test_data",
]
