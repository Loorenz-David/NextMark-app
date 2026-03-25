from __future__ import annotations

from typing import Any

from Delivery_app_BK.errors import ValidationFailed
from Delivery_app_BK.services.context import ServiceContext

from .item_types_data_creators import generate_item_types_test_data
from .order_data_creators import generate_order_test_data
from .plan_data_creators import generate_plan_test_data
from .route_solution_settings_updater import update_route_solutions_settings


def generate_plan_and_order_test_data(ctx: ServiceContext) -> dict[str, Any]:
    """Orchestrate test data generation: item types → plans → orders."""
    incoming_data = ctx.incoming_data if isinstance(ctx.incoming_data, dict) else {}

    # Parse item types data
    raw_item_types_data = incoming_data.get("item_types_data")
    item_types_data = _as_optional_dict(
        raw_item_types_data, field_name="item_types_data"
    )
    if "item_types" in incoming_data and "item_types" not in item_types_data:
        item_types_data["item_types"] = incoming_data.get("item_types")
    if "item_properties" in incoming_data and "item_properties" not in item_types_data:
        item_types_data["item_properties"] = incoming_data.get("item_properties")

    # Parse plan data
    raw_plan_data = incoming_data.get("plan_data")
    plan_data = _as_optional_dict(raw_plan_data, field_name="plan_data")
    if "plans" in incoming_data and "plans" not in plan_data:
        plan_data["plans"] = incoming_data.get("plans")

    # Parse order data
    raw_order_data = incoming_data.get("order_data")
    order_data = _as_optional_dict(raw_order_data, field_name="order_data")
    if "orders_by_plan_type" in incoming_data and "orders_by_plan_type" not in order_data:
        order_data["orders_by_plan_type"] = incoming_data.get("orders_by_plan_type")

    # Parse route solution settings data (validated upfront before any DB work)
    raw_rs_settings_data = incoming_data.get("route_solution_settings_data")
    rs_settings_data = _as_optional_dict(
        raw_rs_settings_data, field_name="route_solution_settings_data"
    )

    # Generate item types first (foundational data for frontend)
    item_types_ctx = _build_child_context(ctx, item_types_data)
    item_types_result = generate_item_types_test_data(item_types_ctx)

    # Generate plans
    plan_ctx = _build_child_context(ctx, plan_data)
    plan_result = generate_plan_test_data(plan_ctx)
    rs_ctx = _build_child_context(ctx, rs_settings_data)
    rs_result = update_route_solutions_settings(rs_ctx, plan_result)

    # Generate orders linked to plans
    order_ctx = _build_child_context(ctx, order_data)
    order_result = generate_order_test_data(order_ctx)

    warnings = []
    warnings.extend(item_types_ctx.warnings)
    warnings.extend(plan_ctx.warnings)
    warnings.extend(order_ctx.warnings)

    return {
        "item_types": item_types_result,
        "plans": plan_result,
        "route_solution_settings": rs_result,
        "orders": order_result,
        "summary": {
            "created_properties": item_types_result.get("properties_count", 0),
            "created_item_types": item_types_result.get("types_count", 0),
            "created_plans": plan_result.get("count", 0),
            "updated_route_solutions": rs_result.get("updated_count", 0),
            "created_orders": order_result.get("count", 0),
        },
        "warnings": warnings,
    }


def _as_optional_dict(value: Any, *, field_name: str) -> dict[str, Any]:
    if value is None:
        return {}
    if not isinstance(value, dict):
        raise ValidationFailed(f"{field_name} must be an object.")
    return dict(value)


def _build_child_context(parent_ctx: ServiceContext, incoming_data: dict[str, Any]) -> ServiceContext:
    return ServiceContext(
        incoming_data=incoming_data,
        incoming_file=parent_ctx.incoming_file,
        query_params=parent_ctx.query_params,
        identity=parent_ctx.identity,
        check_team_id=parent_ctx.check_team_id,
        inject_team_id=parent_ctx.inject_team_id,
        skip_id_instance_injection=parent_ctx.skip_id_instance_injection,
        relationship_map=parent_ctx.relationship_map,
        on_create_return=parent_ctx.on_create_return,
        on_query_return=parent_ctx.on_query_return,
        allow_is_system_modification=parent_ctx.allow_is_system_modification,
        extract_fields_key=parent_ctx.extract_fields_key,
        prevent_event_bus=parent_ctx.prevent_event_bus,
    )


__all__ = ["generate_plan_and_order_test_data", "update_route_solutions_settings"]