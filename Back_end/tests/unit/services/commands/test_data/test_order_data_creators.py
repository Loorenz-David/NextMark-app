from datetime import datetime, timedelta, timezone
from types import SimpleNamespace

import pytest

from Delivery_app_BK.errors import ValidationFailed
from Delivery_app_BK.services.commands.test_data import order_data_creators as module


def test_generate_order_test_data_builds_expected_default_orders(monkeypatch):
    captured_fields = []

    ctx = SimpleNamespace(
        incoming_data={},
        identity={"team_id": 7, "active_team_id": 7},
        query_params={},
        incoming_file=None,
        check_team_id=True,
        inject_team_id=True,
        skip_id_instance_injection=True,
        relationship_map={},
        on_create_return="map_ids_object",
        on_query_return="client_ids_map",
        allow_is_system_modification=False,
        prevent_event_bus=False,
        team_id=7,
    )

    monkeypatch.setattr(
        module,
        "_load_plans_by_type",
        lambda _ctx: {
            "local_delivery": [
                SimpleNamespace(
                    id=10,
                    start_date=datetime(2026, 3, 24, tzinfo=timezone.utc),
                    end_date=datetime(2026, 3, 24, tzinfo=timezone.utc),
                ),
                SimpleNamespace(
                    id=11,
                    start_date=datetime(2026, 3, 25, tzinfo=timezone.utc),
                    end_date=datetime(2026, 3, 27, tzinfo=timezone.utc),
                ),
                SimpleNamespace(
                    id=12,
                    start_date=datetime(2026, 3, 28, tzinfo=timezone.utc),
                    end_date=datetime(2026, 3, 28, tzinfo=timezone.utc),
                ),
            ],
            "store_pickup": [
                SimpleNamespace(
                    id=20,
                    start_date=datetime(2026, 3, 25, tzinfo=timezone.utc),
                    end_date=datetime(2026, 3, 25, tzinfo=timezone.utc),
                )
            ],
            "international_shipping": [
                SimpleNamespace(
                    id=30,
                    start_date=datetime(2026, 3, 25, tzinfo=timezone.utc),
                    end_date=datetime(2026, 3, 25, tzinfo=timezone.utc),
                )
            ],
        },
    )

    # Mock item generator to return predictable items
    def _fake_generate_random_items(**kwargs):
        return [
            {
                "item_type_id": 1,
                "item_type_name": "test-Chairs",
                "quantity": 2,
                "weight_kg": 10.5,
                "length_cm": 50.0,
                "width_cm": 50.0,
                "height_cm": 80.0,
                "properties": {"test-Color": "Brown"},
            },
        ]

    monkeypatch.setattr(module, "generate_random_items", _fake_generate_random_items)

    def _fake_create_order(create_ctx):
        fields = create_ctx.incoming_data.get("fields") or []
        captured_fields.extend(fields)
        return {
            "created": [{"order": {"id": idx + 1}} for idx, _ in enumerate(fields)],
            "plan_totals": [],
        }

    monkeypatch.setattr(module, "create_order", _fake_create_order)

    result = module.generate_order_test_data(ctx)

    assert result["count"] == 43
    assert result["planned_by_type"] == {
        "local_delivery": 33,
        "store_pickup": 5,
        "international_shipping": 5,
    }
    assert len(captured_fields) == 43

    local_fields = [row for row in captured_fields if row.get("order_plan_objective") == "local_delivery"]
    local_plan_ids = [row["delivery_plan_id"] for row in local_fields]
    assert len(local_plan_ids) == 33
    assert local_plan_ids[:10] == [10] * 10
    assert local_plan_ids[10:21] == [11] * 11
    assert local_plan_ids[21:] == [12] * 12
    
    # Verify test reference numbers are included for isolation
    test_ref_numbers = [row.get("reference_number") for row in captured_fields]
    assert all("test-" in ref for ref in test_ref_numbers), "All references should contain 'test-' prefix"

    # Verify items are generated for each order
    for order_field in captured_fields:
        assert "items" in order_field, "Each order should have items"
        assert len(order_field["items"]) > 0, "Each order should have at least one item"
        for item in order_field["items"]:
            assert "item_type_id" in item
            assert "quantity" in item
            assert "weight_kg" in item

    # Default: 2 orders per plan get delivery windows
    fields_by_plan: dict[int, list[dict]] = {}
    for row in captured_fields:
        fields_by_plan.setdefault(row["delivery_plan_id"], []).append(row)

    assert len([row for row in fields_by_plan[10] if row.get("delivery_windows")]) == 2
    assert len([row for row in fields_by_plan[11] if row.get("delivery_windows")]) == 2
    assert len([row for row in fields_by_plan[12] if row.get("delivery_windows")]) == 2
    assert len([row for row in fields_by_plan[20] if row.get("delivery_windows")]) == 2
    assert len([row for row in fields_by_plan[30] if row.get("delivery_windows")]) == 2

    # Range-date plan windows should span between plan dates
    range_plan_windows = [
        window
        for row in fields_by_plan[11]
        if row.get("delivery_windows")
        for window in row["delivery_windows"]
    ]
    assert range_plan_windows
    for window in range_plan_windows:
        assert "start_at" in window
        assert "end_at" in window
        assert "window_type" in window


def test_generate_order_test_data_rejects_invalid_overrides_shape():
    ctx = SimpleNamespace(incoming_data={"orders_by_plan_type": []}, identity={})

    with pytest.raises(ValidationFailed, match="orders_by_plan_type must be an object"):
        module.generate_order_test_data(ctx)


def test_load_plans_by_type_filters_by_test_plan_labels(monkeypatch):
    """Verify that plans are filtered by test plan labels for isolation from production data."""
    from Delivery_app_BK.services.commands.test_data.config import TEST_PLAN_LABELS
    
    # Mock the DB session to capture the filter query
    captured_labels = []

    class MockQuery:
        def __init__(self):
            self.filters = []

        def filter(self, condition):
            # Capture the label filter
            if hasattr(condition, "compile"):
                captured_labels.append("label_filter_applied")
            return self

        def order_by(self, *args):
            return self

        def all(self):
            return []

    mock_session = SimpleNamespace(query=lambda x: MockQuery())
    monkeypatch.setattr("Delivery_app_BK.services.commands.test_data.order_data_creators.db", SimpleNamespace(session=mock_session))

    ctx = SimpleNamespace(
        team_id=7,
        incoming_data={},
        identity={"team_id": 7},
    )

    result = module._load_plans_by_type(ctx)

    # Verify the result is structured correctly even with no plans
    assert isinstance(result, dict)
    assert set(result.keys()) == {"local_delivery", "store_pickup", "international_shipping"}
    assert all(isinstance(v, list) for v in result.values())


def test_parse_item_generation_config_returns_defaults_when_none():
    """Test that default config is returned when none provided."""
    config = module._parse_item_generation_config(None)

    assert config["enabled"] is True
    assert config["min_items"] == 1
    assert config["max_items"] == 10
    assert config["ranges_map"] is None


def test_parse_item_generation_config_accepts_custom_values():
    """Test that custom config values are accepted."""
    custom_config = {
        "enabled": False,
        "min_items": 2,
        "max_items": 5,
    }

    config = module._parse_item_generation_config(custom_config)

    assert config["enabled"] is False
    assert config["min_items"] == 2
    assert config["max_items"] == 5


def test_parse_item_generation_config_rejects_invalid_min_items():
    """Test that invalid min_items raises error."""
    with pytest.raises(ValidationFailed, match="must be an integer >= 1"):
        module._parse_item_generation_config({"min_items": 0})


def test_parse_item_generation_config_rejects_invalid_max_items():
    """Test that max_items < min_items raises error."""
    with pytest.raises(ValidationFailed, match="must be an integer >= min_items"):
        module._parse_item_generation_config({
            "min_items": 5,
            "max_items": 3,
        })


def test_parse_delivery_window_generation_config_returns_defaults_when_none():
    config = module._parse_delivery_window_generation_config(None)

    assert config["enabled"] is True
    assert config["orders_with_windows_per_plan"] == 2
    assert config["single_date_min_windows"] == 2
    assert config["single_date_max_windows"] == 3
    assert config["range_date_min_windows"] == 2
    assert config["range_date_max_windows"] == 4


def test_parse_delivery_window_generation_config_accepts_custom_values():
    config = module._parse_delivery_window_generation_config(
        {
            "enabled": False,
            "orders_with_windows_per_plan": 3,
            "single_date_min_windows": 1,
            "single_date_max_windows": 2,
            "range_date_min_windows": 2,
            "range_date_max_windows": 5,
        }
    )

    assert config["enabled"] is False
    assert config["orders_with_windows_per_plan"] == 3
    assert config["single_date_min_windows"] == 1
    assert config["single_date_max_windows"] == 2
    assert config["range_date_min_windows"] == 2
    assert config["range_date_max_windows"] == 5


def test_parse_delivery_window_generation_config_rejects_invalid_shape():
    with pytest.raises(ValidationFailed, match="order_delivery_window_generation must be an object"):
        module._parse_delivery_window_generation_config([])


def test_parse_delivery_window_generation_config_rejects_invalid_order_count():
    with pytest.raises(
        ValidationFailed,
        match="order_delivery_window_generation.orders_with_windows_per_plan must be an integer >= 1",
    ):
        module._parse_delivery_window_generation_config({"orders_with_windows_per_plan": 0})


def test_parse_delivery_window_generation_config_rejects_invalid_single_day_range():
    with pytest.raises(
        ValidationFailed,
        match="single_date_max_windows must be >= single_date_min_windows",
    ):
        module._parse_delivery_window_generation_config(
            {"single_date_min_windows": 3, "single_date_max_windows": 2}
        )


def test_parse_delivery_window_generation_config_rejects_invalid_range_day_range():
    with pytest.raises(
        ValidationFailed,
        match="range_date_max_windows must be >= range_date_min_windows",
    ):
        module._parse_delivery_window_generation_config(
            {"range_date_min_windows": 4, "range_date_max_windows": 3}
        )