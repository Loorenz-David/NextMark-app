from __future__ import annotations

from copy import deepcopy
from datetime import date, datetime, timedelta, timezone
from typing import Any

from Delivery_app_BK.errors import ValidationFailed
from Delivery_app_BK.models import DeliveryPlan, db
from Delivery_app_BK.services.commands.order.create_order import create_order
from Delivery_app_BK.services.context import ServiceContext

from .config import (
    DEFAULT_LOCAL_DELIVERY_ORDERS_PER_PLAN_MAX,
    DEFAULT_LOCAL_DELIVERY_ORDERS_PER_PLAN_MIN,
    DEFAULT_ORDER_PLAN_TYPES,
    TEST_PLAN_LABELS,
    build_default_order_templates_by_plan_type,
)
from .config.item_generation_defaults import (
    DEFAULT_ITEMS_MAX_PER_ORDER,
    DEFAULT_ITEMS_MIN_PER_ORDER,
)
from .item_generator import generate_random_items


def generate_order_test_data(ctx: ServiceContext) -> dict[str, Any]:
    """Create and link default orders to existing plans with randomly generated items."""
    incoming_data = ctx.incoming_data if isinstance(ctx.incoming_data, dict) else {}
    overrides = _parse_orders_by_plan_type_overrides(incoming_data.get("orders_by_plan_type"))

    # Parse item generation configuration
    item_gen_config = _parse_item_generation_config(incoming_data.get("order_item_generation"))
    window_gen_config = _parse_delivery_window_generation_config(
        incoming_data.get("order_delivery_window_generation")
    )

    plan_instances_by_type = _load_plans_by_type(ctx)
    order_templates_by_type = build_default_order_templates_by_plan_type()
    order_templates_by_type.update(overrides)

    fields: list[dict] = []
    planned_count_by_type: dict[str, int] = {}
    now_utc = datetime.now(timezone.utc)

    for plan_type in DEFAULT_ORDER_PLAN_TYPES:
        plans = plan_instances_by_type.get(plan_type) or []
        templates = order_templates_by_type.get(plan_type) or []
        if not templates or not plans:
            planned_count_by_type[plan_type] = 0
            continue

        if plan_type == "local_delivery":
            generated_rows = _build_fields_for_local_delivery_plan_type(
                templates=templates,
                plans=plans,
                now_utc=now_utc,
                ctx=ctx,
                item_gen_config=item_gen_config,
                window_gen_config=window_gen_config,
            )
        else:
            generated_rows = _build_fields_for_plan_type(
                plan_type=plan_type,
                templates=templates,
                plans=plans,
                now_utc=now_utc,
                ctx=ctx,
                item_gen_config=item_gen_config,
                window_gen_config=window_gen_config,
            )
        fields.extend(generated_rows)
        planned_count_by_type[plan_type] = len(generated_rows)

    if not fields:
        return {
            "created": [],
            "count": 0,
            "planned_by_type": planned_count_by_type,
            "warnings": ["No matching plans found for default order generation."],
        }

    create_ctx = ServiceContext(
        incoming_data={"fields": fields},
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

    outcome = create_order(create_ctx)

    return {
        "created": outcome.get("created", []),
        "count": len(outcome.get("created", [])),
        "planned_by_type": planned_count_by_type,
        "plan_totals": outcome.get("plan_totals", []),
        "warnings": create_ctx.warnings,
    }


def _build_fields_for_plan_type(
    *,
    plan_type: str,
    templates: list[dict],
    plans: list[DeliveryPlan],
    now_utc: datetime,
    ctx: ServiceContext,
    item_gen_config: dict[str, Any],
    window_gen_config: dict[str, Any],
) -> list[dict]:
    generated: list[dict] = []
    plan_by_id: dict[int, DeliveryPlan] = {}
    for index, template in enumerate(templates):
        plan = plans[index % len(plans)]
        fields = deepcopy(template)
        fields["route_plan_id"] = plan.id
        fields["order_plan_objective"] = plan_type

        # Generate random items for this order if config allows
        if item_gen_config.get("enabled", True):
            items = generate_random_items(
                ctx=ctx,
                min_items=item_gen_config.get("min_items", DEFAULT_ITEMS_MIN_PER_ORDER),
                max_items=item_gen_config.get("max_items", DEFAULT_ITEMS_MAX_PER_ORDER),
                ranges_map=item_gen_config.get("ranges_map"),
            )
            fields["items"] = items
        else:
            fields.setdefault("items", [])

        plan_by_id[plan.id] = plan

        generated.append(fields)

    _assign_delivery_windows_to_plan_rows(
        generated_rows=generated,
        plan_by_id=plan_by_id,
        now_utc=now_utc,
        config=window_gen_config,
    )

    return generated


def _build_fields_for_local_delivery_plan_type(
    *,
    templates: list[dict],
    plans: list[DeliveryPlan],
    now_utc: datetime,
    ctx: ServiceContext,
    item_gen_config: dict[str, Any],
    window_gen_config: dict[str, Any],
) -> list[dict]:
    generated: list[dict] = []
    plan_by_id: dict[int, DeliveryPlan] = {}

    template_cursor = 0
    for plan_index, plan in enumerate(plans):
        orders_for_plan = _deterministic_count(
            DEFAULT_LOCAL_DELIVERY_ORDERS_PER_PLAN_MIN,
            DEFAULT_LOCAL_DELIVERY_ORDERS_PER_PLAN_MAX,
            plan_index,
        )
        for _ in range(orders_for_plan):
            template = templates[template_cursor % len(templates)]
            template_cursor += 1

            fields = deepcopy(template)
            fields["route_plan_id"] = plan.id
            fields["order_plan_objective"] = "local_delivery"

            if item_gen_config.get("enabled", True):
                items = generate_random_items(
                    ctx=ctx,
                    min_items=item_gen_config.get("min_items", DEFAULT_ITEMS_MIN_PER_ORDER),
                    max_items=item_gen_config.get("max_items", DEFAULT_ITEMS_MAX_PER_ORDER),
                    ranges_map=item_gen_config.get("ranges_map"),
                )
                fields["items"] = items
            else:
                fields.setdefault("items", [])

            plan_by_id[plan.id] = plan
            generated.append(fields)

    _assign_delivery_windows_to_plan_rows(
        generated_rows=generated,
        plan_by_id=plan_by_id,
        now_utc=now_utc,
        config=window_gen_config,
    )

    return generated


def _parse_orders_by_plan_type_overrides(value: Any) -> dict[str, list[dict]]:
    if value is None:
        return {}
    if not isinstance(value, dict):
        raise ValidationFailed("orders_by_plan_type must be an object.")

    parsed: dict[str, list[dict]] = {}
    for plan_type, templates in value.items():
        if plan_type not in DEFAULT_ORDER_PLAN_TYPES:
            raise ValidationFailed(
                f"orders_by_plan_type has unsupported plan type '{plan_type}'. "
                f"Allowed values: {list(DEFAULT_ORDER_PLAN_TYPES)}"
            )
        if not isinstance(templates, list):
            raise ValidationFailed(f"orders_by_plan_type.{plan_type} must be a list.")

        parsed_templates: list[dict] = []
        for index, template in enumerate(templates):
            if not isinstance(template, dict):
                raise ValidationFailed(
                    f"orders_by_plan_type.{plan_type}[{index}] must be an object."
                )
            parsed_templates.append(template)
        parsed[plan_type] = parsed_templates

    return parsed


def _parse_item_generation_config(value: Any) -> dict[str, Any]:
    """Parse and validate item generation configuration."""
    if value is None:
        return {
            "enabled": True,
            "min_items": DEFAULT_ITEMS_MIN_PER_ORDER,
            "max_items": DEFAULT_ITEMS_MAX_PER_ORDER,
            "ranges_map": None,
        }

    if not isinstance(value, dict):
        raise ValidationFailed("order_item_generation must be an object.")

    config = {
        "enabled": value.get("enabled", True),
        "min_items": value.get("min_items", DEFAULT_ITEMS_MIN_PER_ORDER),
        "max_items": value.get("max_items", DEFAULT_ITEMS_MAX_PER_ORDER),
        "ranges_map": value.get("ranges_map"),
    }

    # Validate ranges
    if not isinstance(config["min_items"], int) or config["min_items"] < 1:
        raise ValidationFailed("order_item_generation.min_items must be an integer >= 1.")
    if not isinstance(config["max_items"], int) or config["max_items"] < config["min_items"]:
        raise ValidationFailed(
            "order_item_generation.max_items must be an integer >= min_items."
        )

    return config


def _parse_delivery_window_generation_config(value: Any) -> dict[str, Any]:
    """Parse and validate delivery-window generation configuration."""
    defaults = {
        "enabled": True,
        "orders_with_windows_per_plan": 2,
        "single_date_min_windows": 2,
        "single_date_max_windows": 3,
        "range_date_min_windows": 2,
        "range_date_max_windows": 4,
    }
    if value is None:
        return defaults
    if not isinstance(value, dict):
        raise ValidationFailed("order_delivery_window_generation must be an object.")

    config = {
        "enabled": value.get("enabled", defaults["enabled"]),
        "orders_with_windows_per_plan": value.get(
            "orders_with_windows_per_plan", defaults["orders_with_windows_per_plan"]
        ),
        "single_date_min_windows": value.get(
            "single_date_min_windows", defaults["single_date_min_windows"]
        ),
        "single_date_max_windows": value.get(
            "single_date_max_windows", defaults["single_date_max_windows"]
        ),
        "range_date_min_windows": value.get(
            "range_date_min_windows", defaults["range_date_min_windows"]
        ),
        "range_date_max_windows": value.get(
            "range_date_max_windows", defaults["range_date_max_windows"]
        ),
    }

    for key in (
        "orders_with_windows_per_plan",
        "single_date_min_windows",
        "single_date_max_windows",
        "range_date_min_windows",
        "range_date_max_windows",
    ):
        if not isinstance(config[key], int) or config[key] < 1:
            raise ValidationFailed(
                f"order_delivery_window_generation.{key} must be an integer >= 1."
            )

    if config["single_date_max_windows"] < config["single_date_min_windows"]:
        raise ValidationFailed(
            "order_delivery_window_generation.single_date_max_windows must be >= single_date_min_windows."
        )
    if config["range_date_max_windows"] < config["range_date_min_windows"]:
        raise ValidationFailed(
            "order_delivery_window_generation.range_date_max_windows must be >= range_date_min_windows."
        )

    return config


def _assign_delivery_windows_to_plan_rows(
    *,
    generated_rows: list[dict],
    plan_by_id: dict[int, DeliveryPlan],
    now_utc: datetime,
    config: dict[str, Any],
) -> None:
    if not config.get("enabled", True):
        return

    rows_by_plan: dict[int, list[dict]] = {}
    for row in generated_rows:
        plan_id = row.get("route_plan_id")
        if isinstance(plan_id, int):
            rows_by_plan.setdefault(plan_id, []).append(row)

    for plan_id, rows in rows_by_plan.items():
        plan = plan_by_id.get(plan_id)
        if plan is None:
            continue

        existing_with_windows = [row for row in rows if row.get("delivery_windows")]
        target_count = min(config["orders_with_windows_per_plan"], len(rows))
        remaining = max(0, target_count - len(existing_with_windows))
        if remaining == 0:
            continue

        candidates = [row for row in rows if not row.get("delivery_windows")]
        for offset, row in enumerate(candidates[:remaining]):
            row["delivery_windows"] = _build_windows_for_plan(
                plan=plan,
                now_utc=now_utc,
                config=config,
                seed_index=offset,
            )


def _build_windows_for_plan(
    *,
    plan: DeliveryPlan,
    now_utc: datetime,
    config: dict[str, Any],
    seed_index: int,
) -> list[dict]:
    start_date = _normalize_plan_date(getattr(plan, "start_date", None), now_utc)
    end_date = _normalize_plan_date(getattr(plan, "end_date", None), now_utc)
    if end_date < start_date:
        start_date, end_date = end_date, start_date

    is_single_day = start_date == end_date
    if is_single_day:
        window_count = _deterministic_count(
            config["single_date_min_windows"],
            config["single_date_max_windows"],
            seed_index,
        )
        return _build_single_day_windows(start_date, window_count, now_utc)

    window_count = _deterministic_count(
        config["range_date_min_windows"],
        config["range_date_max_windows"],
        seed_index,
    )
    return _build_range_day_windows(start_date, end_date, window_count, now_utc)


def _build_single_day_windows(
    target_date: date,
    window_count: int,
    now_utc: datetime,
) -> list[dict]:
    slot_starts = [9, 11, 13, 15, 17]
    windows: list[dict] = []
    for index in range(window_count):
        hour = slot_starts[index % len(slot_starts)]
        start_at = datetime.combine(target_date, datetime.min.time(), tzinfo=timezone.utc) + timedelta(
            hours=hour
        )
        start_at = _ensure_future_start(start_at, now_utc)
        end_at = start_at + timedelta(hours=1)
        windows.append(
            {
                "start_at": start_at.isoformat(),
                "end_at": end_at.isoformat(),
                "window_type": "TIME_RANGE",
            }
        )
    return windows


def _build_range_day_windows(
    start_date: date,
    end_date: date,
    window_count: int,
    now_utc: datetime,
) -> list[dict]:
    total_days = max(1, (end_date - start_date).days + 1)
    windows: list[dict] = []
    for index in range(window_count):
        day_offset = index % total_days
        target_date = start_date + timedelta(days=day_offset)
        hour = [9, 13, 16][index % 3]
        start_at = datetime.combine(target_date, datetime.min.time(), tzinfo=timezone.utc) + timedelta(
            hours=hour
        )
        start_at = _ensure_future_start(start_at, now_utc)
        end_at = start_at + timedelta(hours=1)
        windows.append(
            {
                "start_at": start_at.isoformat(),
                "end_at": end_at.isoformat(),
                "window_type": "TIME_RANGE",
            }
        )
    return windows


def _normalize_plan_date(value: Any, now_utc: datetime) -> date:
    if isinstance(value, datetime):
        return value.astimezone(timezone.utc).date() if value.tzinfo else value.date()
    if isinstance(value, date):
        return value
    return now_utc.date()


def _deterministic_count(min_value: int, max_value: int, seed_index: int) -> int:
    span = max_value - min_value + 1
    return min_value + (seed_index % span)


def _ensure_future_start(start_at: datetime, now_utc: datetime) -> datetime:
    """Shift a window start into the future while preserving time-of-day slots."""
    candidate = start_at
    while candidate <= now_utc:
        candidate = candidate + timedelta(days=1)
    return candidate


def _load_plans_by_type(ctx: ServiceContext) -> dict[str, list[DeliveryPlan]]:
    """Load test plans filtered by plan type and test plan labels."""
    query = db.session.query(DeliveryPlan)
    if isinstance(ctx.team_id, int):
        query = query.filter(DeliveryPlan.team_id == ctx.team_id)

    # Filter by test plan labels only - ensures we link to test data, not production plans
    test_labels_flat = []
    for plan_type in DEFAULT_ORDER_PLAN_TYPES:
        test_labels_flat.extend(TEST_PLAN_LABELS.get(plan_type, []))
    query = query.filter(DeliveryPlan.label.in_(test_labels_flat))

    plans = query.order_by(
        DeliveryPlan.start_date.asc(),
        DeliveryPlan.id.asc(),
    ).all()

    grouped: dict[str, list[DeliveryPlan]] = {plan_type: [] for plan_type in DEFAULT_ORDER_PLAN_TYPES}
    plan_type_by_label = {
        label: plan_type
        for plan_type, labels in TEST_PLAN_LABELS.items()
        for label in labels
    }
    for plan in plans:
        plan_type = getattr(plan, "plan_type", None) or plan_type_by_label.get(plan.label)
        if plan_type in grouped:
            grouped[plan_type].append(plan)
    return grouped


__all__ = [
    "generate_order_test_data",
]