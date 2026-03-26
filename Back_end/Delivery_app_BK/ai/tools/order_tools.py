from __future__ import annotations
import logging
import re

from Delivery_app_BK.errors import ValidationFailed
from Delivery_app_BK.services.context import ServiceContext
from Delivery_app_BK.services.commands.order.create_order import create_order as create_order_service
from Delivery_app_BK.services.commands.order.update_order import update_order as update_order_service
from Delivery_app_BK.services.commands.order.update_order import MUTABLE_FIELDS as ORDER_MUTABLE_FIELDS
from Delivery_app_BK.services.commands.order.order_states.update_orders_state import update_orders_state
from Delivery_app_BK.services.commands.order.update_order_delivery_plan import (
    update_orders_delivery_plan,
)
from Delivery_app_BK.services.queries.order.list_orders import (
    list_orders as list_orders_service,
)
from Delivery_app_BK.services.domain.order.order_states import OrderStateId
from Delivery_app_BK.ai.tools.item_tools import _generate_article_number

logger = logging.getLogger(__name__)

_WEIGHT_RE = re.compile(r"\bweight\s*(<=|>=|=)\s*([0-9]*\.?[0-9]+)\s*(kg|g)\b", re.IGNORECASE)
_VOLUME_RE = re.compile(r"\bvolume\s*(<=|>=|=)\s*([0-9]*\.?[0-9]+)\s*(l|ml|cm3)\b", re.IGNORECASE)


def _convert_weight_to_grams(value: float, unit: str) -> float:
    return value * 1000.0 if unit.lower() == "kg" else value


def _convert_volume_to_cm3(value: float, unit: str) -> float:
    normalized = unit.lower()
    if normalized == "l":
        return value * 1000.0
    if normalized == "ml":
        return value
    return value


def _apply_numeric_filter(filters: dict, key_map: dict[str, str], operator: str, value: float) -> None:
    key = key_map.get(operator)
    if key:
        filters[key] = value


def _extract_numeric_filters_from_q(q: str) -> tuple[str, dict]:
    derived: dict = {}
    remaining = q or ""

    for match in list(_WEIGHT_RE.finditer(remaining)):
        operator, raw_value, unit = match.groups()
        grams = _convert_weight_to_grams(float(raw_value), unit)
        _apply_numeric_filter(
            derived,
            {
                "=": "total_weight_eq_g",
                ">=": "total_weight_min_g",
                "<=": "total_weight_max_g",
            },
            operator,
            grams,
        )
    remaining = _WEIGHT_RE.sub(" ", remaining)

    for match in list(_VOLUME_RE.finditer(remaining)):
        operator, raw_value, unit = match.groups()
        cm3 = _convert_volume_to_cm3(float(raw_value), unit)
        _apply_numeric_filter(
            derived,
            {
                "=": "total_volume_eq_cm3",
                ">=": "total_volume_min_cm3",
                "<=": "total_volume_max_cm3",
            },
            operator,
            cm3,
        )
    remaining = _VOLUME_RE.sub(" ", remaining)

    cleaned = " ".join(remaining.split())
    return cleaned, derived


def list_orders_tool(
    ctx: ServiceContext,
    plan_id: int | None = None,
    # free-text search
    q: str | None = None,
    s: list[str] | None = None,
    # schedule state
    scheduled: bool | None = None,
    show_archived: bool | None = None,
    # identity filters
    order_state_id: int | list[int] | None = None,
    # date filters
    creation_date_from: str | None = None,
    creation_date_to: str | None = None,
    total_weight_min_g: float | None = None,
    total_weight_max_g: float | None = None,
    total_weight_eq_g: float | None = None,
    total_volume_min_cm3: float | None = None,
    total_volume_max_cm3: float | None = None,
    total_volume_eq_cm3: float | None = None,
    # pagination
    limit: int | None = None,
    sort: str | None = None,
) -> dict:
    """List orders with full filter support."""
    filters: dict = {}

    if q is not None:
        cleaned_q, derived_filters = _extract_numeric_filters_from_q(q)
        filters.update(derived_filters)
        if cleaned_q:
            filters["q"] = cleaned_q
    if s is not None:
        filters["s"] = s
    if scheduled is True:
        filters["schedule_order"] = True
    elif scheduled is False:
        filters["unschedule_order"] = True
    if show_archived is not None:
        filters["show_archived"] = str(show_archived).lower()
    if order_state_id is not None:
        filters["order_state_id"] = order_state_id
    if creation_date_from is not None:
        filters["creation_date_from"] = creation_date_from
    if creation_date_to is not None:
        filters["creation_date_to"] = creation_date_to
    if total_weight_min_g is not None:
        filters["total_weight_min_g"] = total_weight_min_g
    if total_weight_max_g is not None:
        filters["total_weight_max_g"] = total_weight_max_g
    if total_weight_eq_g is not None:
        filters["total_weight_eq_g"] = total_weight_eq_g
    if total_volume_min_cm3 is not None:
        filters["total_volume_min_cm3"] = total_volume_min_cm3
    if total_volume_max_cm3 is not None:
        filters["total_volume_max_cm3"] = total_volume_max_cm3
    if total_volume_eq_cm3 is not None:
        filters["total_volume_eq_cm3"] = total_volume_eq_cm3
    if limit is not None:
        filters["limit"] = limit
    if sort is not None:
        filters["sort"] = sort

    ctx.query_params = {**ctx.query_params, **filters}
    return list_orders_service(ctx, plan_id=plan_id)


def assign_orders_to_plan_tool(
    ctx: ServiceContext,
    order_ids: list[int],
    plan_id: int,
) -> dict:
    """
    Assign a list of orders to a delivery plan.
    This is how orders get 'scheduled' — by linking them to a plan.
    Always call find_plans_for_schedule or create_plan first to get the plan_id.
    """
    if not order_ids:
        return {"status": "no_orders", "assigned": 0}

    result = update_orders_delivery_plan(ctx, order_ids, plan_id)
    updated = result.get("updated") or []

    logger.info(
        "assign_orders_to_plan_tool | plan_id=%s | requested=%d | assigned=%d",
        plan_id,
        len(order_ids),
        len(updated),
    )
    return {
        "status": "assigned",
        "plan_id": plan_id,
        "requested": len(order_ids),
        "assigned": len(updated),
    }


# ---------------------------------------------------------------------------
# State name → ID map (system states only — matches OrderStateId constants)
# ---------------------------------------------------------------------------

_ORDER_STATE_NAME_TO_ID: dict[str, int] = {
    "Draft": OrderStateId.DRAFT,
    "Confirmed": OrderStateId.CONFIRMED,
    "Preparing": OrderStateId.PREPARING,
    "Ready": OrderStateId.READY,
    "Processing": OrderStateId.PROCESSING,
    "Completed": OrderStateId.COMPLETED,
    "Fail": OrderStateId.FAIL,
    "Cancelled": OrderStateId.CANCELLED,
}


def update_order_state_tool(
    ctx: ServiceContext,
    order_ids: list[int],
    state_name: str,
) -> dict:
    """
    Transition one or more orders to a new state by name.
    State name must be one of: Draft, Confirmed, Preparing, Ready, Processing, Completed, Fail, Cancelled.
    Always call list_orders first to confirm the target orders before changing state.
    """
    if not order_ids:
        raise ValidationFailed("order_ids must be a non-empty list.")

    state_id = _ORDER_STATE_NAME_TO_ID.get(state_name)
    if state_id is None:
        valid = sorted(_ORDER_STATE_NAME_TO_ID.keys())
        raise ValidationFailed(
            f"Unknown order state '{state_name}'. Valid states: {valid}"
        )

    update_orders_state(ctx, order_ids, state_id)

    logger.info(
        "update_order_state_tool | state=%s(%d) | order_ids=%s",
        state_name,
        state_id,
        order_ids,
    )
    return {
        "status": "updated",
        "state": state_name,
        "order_ids": order_ids,
        "count": len(order_ids),
    }


# Fields the AI is allowed to mutate via update_order_tool
_ALLOWED_UPDATE_FIELDS = ORDER_MUTABLE_FIELDS - {"delivery_windows"}


def update_order_tool(
    ctx: ServiceContext,
    order_id: int,
    fields: dict,
) -> dict:
    """
    Update mutable fields on a single order.
    Allowed fields: reference_number, external_source, external_tracking_number,
    external_tracking_link, client_first_name, client_last_name, client_email,
    client_primary_phone, client_secondary_phone, client_address, order_notes.
    NEVER use this to change order state or delivery plan — use dedicated tools.
    """
    if not fields:
        raise ValidationFailed("fields must be a non-empty dict.")

    invalid = set(fields.keys()) - _ALLOWED_UPDATE_FIELDS
    if invalid:
        raise ValidationFailed(
            f"Fields not allowed for AI update: {sorted(invalid)}. "
            f"Allowed: {sorted(_ALLOWED_UPDATE_FIELDS)}"
        )

    ctx.incoming_data = {
        "targets": [{"target_id": order_id, "fields": fields}]
    }
    update_order_service(ctx)

    logger.info(
        "update_order_tool | order_id=%s | fields=%s",
        order_id,
        list(fields.keys()),
    )
    return {
        "status": "updated",
        "order_id": order_id,
        "updated_fields": sorted(fields.keys()),
    }


# ---------------------------------------------------------------------------
# create_order_tool
# ---------------------------------------------------------------------------

def create_order_tool(
    ctx: ServiceContext,
    # ── client identity ──────────────────────────────────────────────────
    client_first_name: str | None = None,
    client_last_name: str | None = None,
    client_email: str | None = None,
    client_primary_phone: dict | None = None,
    client_secondary_phone: dict | None = None,
    # ── delivery address ─────────────────────────────────────────────────
    client_address: dict | None = None,
    # ── order metadata ───────────────────────────────────────────────────
    reference_number: str | None = None,
    external_source: str | None = None,
    external_tracking_number: str | None = None,
    external_tracking_link: str | None = None,
    order_notes: str | None = None,
    order_plan_objective: str | None = None,
    operation_type: str | None = None,
    # ── scheduling ───────────────────────────────────────────────────────
    route_plan_id: int | None = None,
    delivery_windows: list[dict] | None = None,
    # ── items ────────────────────────────────────────────────────────────
    items: list[dict] | None = None,
) -> dict:
    """
    Create a new order, optionally with items in a single call.

    client_address shape:
      { "street_address": "...", "postal_code": "...", "city": "...",
        "country": "SE", "coordinates": {"lat": 59.33, "lng": 18.07} }
      coordinates are optional but improve route optimization.

    client_primary_phone / client_secondary_phone shape:
      { "prefix": "+46", "number": "701234567" }

    items[] shape (each item):
      {
        "item_type": "table",           # used as article_number if none given
        "article_number": "TBL-001",    # optional — auto-generated if missing
        "quantity": 1,
        "properties": { "extensions": 2, "material": "oak" },  # optional
        "weight": 25,                   # kg, optional
        "reference_number": "...",      # optional
        "item_type": "..."              # optional
      }
    RULE: Always call search_item_types first to discover the correct item_type
    and properties structure before calling create_order with items.

    delivery_windows[] shape:
      { "start_at": "2026-03-21T08:00:00Z", "end_at": "2026-03-21T12:00:00Z",
        "window_type": "delivery" }
    """
    fields: dict = {}

    if client_first_name is not None:
        fields["client_first_name"] = client_first_name
    if client_last_name is not None:
        fields["client_last_name"] = client_last_name
    if client_email is not None:
        fields["client_email"] = client_email
    if client_primary_phone is not None:
        fields["client_primary_phone"] = client_primary_phone
    if client_secondary_phone is not None:
        fields["client_secondary_phone"] = client_secondary_phone
    if client_address is not None:
        fields["client_address"] = client_address
    if reference_number is not None:
        fields["reference_number"] = reference_number
    if external_source is not None:
        fields["external_source"] = external_source
    if external_tracking_number is not None:
        fields["external_tracking_number"] = external_tracking_number
    if external_tracking_link is not None:
        fields["external_tracking_link"] = external_tracking_link
    if order_notes is not None:
        fields["order_notes"] = order_notes
    if order_plan_objective is not None:
        fields["order_plan_objective"] = order_plan_objective
    if operation_type is not None:
        fields["operation_type"] = operation_type
    if route_plan_id is not None:
        fields["route_plan_id"] = route_plan_id
    if delivery_windows is not None:
        fields["delivery_windows"] = delivery_windows

    # Normalise items — inject article_number if missing
    if items:
        normalised_items = []
        for item in items:
            item = dict(item)
            if not item.get("article_number"):
                item_type = item.get("item_type") or "item"
                item["article_number"] = _generate_article_number(item_type)
                logger.info(
                    "create_order_tool | generated article_number=%r for item_type=%r",
                    item["article_number"],
                    item_type,
                )
            normalised_items.append(item)
        fields["items"] = normalised_items

    ctx.incoming_data = {"fields": fields}
    result = create_order_service(ctx)

    # Extract created order ID from result bundle
    bundles = result.get("created", []) if isinstance(result, dict) else []
    order_id = None
    if isinstance(bundles, list) and bundles:
        order = bundles[0].get("order") or {}
        order_id = order.get("id")

    logger.info(
        "create_order_tool | order_id=%s | items=%d",
        order_id,
        len(items or []),
    )
    return {
        "status": "created",
        "order_id": order_id,
        "items_created": len(items or []),
        "result": result,
    }
