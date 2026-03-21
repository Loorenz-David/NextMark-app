from __future__ import annotations

from typing import Any

from Delivery_app_BK.errors import ValidationFailed
from Delivery_app_BK.services.context import ServiceContext
from Delivery_app_BK.services.commands.item.create.create_item_property import (
    create_item_property as create_item_property_service,
)
from Delivery_app_BK.services.commands.item.create.create_item_type import (
    create_item_type as create_item_type_service,
)
from Delivery_app_BK.services.commands.item.update.update_item_property import (
    update_item_property as update_item_property_service,
)
from Delivery_app_BK.services.commands.item.update.update_item_type import (
    update_item_type as update_item_type_service,
)
from Delivery_app_BK.services.queries.item_property.get_item_property import (
    get_item_property as get_item_property_service,
)
from Delivery_app_BK.services.queries.item_property.list_item_properties import (
    list_item_properties as list_item_properties_service,
)
from Delivery_app_BK.services.queries.item_type.get_item_type import (
    get_item_type as get_item_type_service,
)
from Delivery_app_BK.services.queries.item_type.list_item_types import (
    list_item_types as list_item_types_service,
)


def list_item_types_config_tool(
    ctx: ServiceContext,
    name: str | None = None,
    limit: int = 50,
    sort: str = "id_desc",
) -> dict:
    filters: dict[str, Any] = {"limit": limit, "sort": sort}
    if name:
        filters["name"] = name

    ctx.query_params = {**ctx.query_params, **filters}
    result = list_item_types_service(ctx)

    item_types = result.get("item_types") or []
    return {
        "item_types": item_types,
        "count": len(item_types),
        "item_types_pagination": result.get("item_types_pagination"),
    }


def list_item_properties_config_tool(
    ctx: ServiceContext,
    name: str | None = None,
    field_type: str | None = None,
    required: bool | None = None,
    limit: int = 50,
    sort: str = "id_desc",
) -> dict:
    filters: dict[str, Any] = {"limit": limit, "sort": sort}
    if name:
        filters["name"] = name
    if field_type:
        filters["field_type"] = field_type
    if required is not None:
        filters["required"] = required

    ctx.query_params = {**ctx.query_params, **filters}
    result = list_item_properties_service(ctx)

    item_properties = result.get("item_properties") or []
    return {
        "item_properties": item_properties,
        "count": len(item_properties),
        "item_properties_pagination": result.get("item_properties_pagination"),
    }


def get_item_type_config_tool(ctx: ServiceContext, item_type_id: int) -> dict:
    return get_item_type_service(item_type_id, ctx)


def get_item_property_config_tool(ctx: ServiceContext, item_property_id: int) -> dict:
    return get_item_property_service(item_property_id, ctx)


def create_item_type_config_tool(
    ctx: ServiceContext,
    name: str,
    property_ids: list[int] | None = None,
) -> dict:
    fields: dict[str, Any] = {"name": name}
    if property_ids is not None:
        fields["properties"] = property_ids

    ctx.incoming_data = {"fields": fields}
    result = create_item_type_service(ctx)

    created = _extract_first_created(result, "item_type")
    return {
        "status": "created",
        "item_type": created,
        "result": result,
    }


def create_item_property_config_tool(
    ctx: ServiceContext,
    name: str,
    field_type: str = "text",
    required: bool = False,
    options: list[Any] | None = None,
    item_type_ids: list[int] | None = None,
) -> dict:
    fields: dict[str, Any] = {
        "name": name,
        "field_type": field_type,
        "required": required,
    }
    if options is not None:
        fields["options"] = options
    if item_type_ids is not None:
        fields["item_types"] = item_type_ids

    ctx.incoming_data = {"fields": fields}
    result = create_item_property_service(ctx)

    created = _extract_first_created(result, "item_property")
    return {
        "status": "created",
        "item_property": created,
        "result": result,
    }


def update_item_type_config_tool(
    ctx: ServiceContext,
    item_type_id: int,
    fields: dict[str, Any],
) -> dict:
    if not fields:
        raise ValidationFailed("fields must be a non-empty dict.")

    ctx.incoming_data = {
        "targets": [
            {
                "target_id": item_type_id,
                "fields": fields,
            }
        ]
    }
    updated_ids = update_item_type_service(ctx)
    return {
        "status": "updated",
        "item_type_id": item_type_id,
        "updated_ids": updated_ids,
        "fields": fields,
    }


def update_item_property_config_tool(
    ctx: ServiceContext,
    item_property_id: int,
    fields: dict[str, Any],
) -> dict:
    if not fields:
        raise ValidationFailed("fields must be a non-empty dict.")

    ctx.incoming_data = {
        "targets": [
            {
                "target_id": item_property_id,
                "fields": fields,
            }
        ]
    }
    updated_ids = update_item_property_service(ctx)
    return {
        "status": "updated",
        "item_property_id": item_property_id,
        "updated_ids": updated_ids,
        "fields": fields,
    }


def link_properties_to_item_type_tool(
    ctx: ServiceContext,
    item_type_id: int,
    property_ids: list[int],
    merge: bool = True,
) -> dict:
    if not property_ids:
        raise ValidationFailed("property_ids must be a non-empty list.")

    desired_ids = [int(pid) for pid in property_ids]
    if merge:
        found = get_item_type_service(item_type_id, ctx)
        item_type = found.get("item_type") or {}
        existing_ids = item_type.get("properties") or []
        desired_ids = sorted(set(existing_ids + desired_ids))

    return update_item_type_config_tool(
        ctx,
        item_type_id=item_type_id,
        fields={"properties": desired_ids},
    )


def _extract_first_created(result: dict, key: str) -> dict | None:
    raw = result.get(key)
    if isinstance(raw, list) and raw:
        first = raw[0]
        return first if isinstance(first, dict) else None
    if isinstance(raw, dict):
        return raw
    return None
