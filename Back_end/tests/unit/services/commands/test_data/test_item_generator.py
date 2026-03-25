from types import SimpleNamespace

import pytest

from Delivery_app_BK.services.commands.test_data import item_generator as module
from Delivery_app_BK.services.commands.test_data.config.item_generation_defaults import (
    ItemTypeRanges,
    build_item_type_ranges_map,
)


class MockItemProperty:
    def __init__(self, name: str, field_type: str, options=None):
        self.name = name
        self.field_type = field_type
        self.options = options


class MockItemType:
    def __init__(self, id: int, name: str, properties: list):
        self.id = id
        self.name = name
        self.properties = properties


def test_generate_random_items_creates_items_within_range(monkeypatch):
    """Test that items are generated within the specified min/max range."""
    ctx = SimpleNamespace(team_id=7, incoming_data={})

    # Mock item types
    mock_types = [
        MockItemType(
            id=1,
            name="test-Vintage Chairs & Seating",
            properties=[
                MockItemProperty("test-Condition", "select", ["Good"]),
                MockItemProperty("test-Color", "text"),
            ],
        ),
        MockItemType(
            id=2,
            name="test-Tables & Desk Collections",
            properties=[
                MockItemProperty("test-Material", "select", ["Wood"]),
            ],
        ),
    ]

    monkeypatch.setattr(
        module,
        "_load_available_item_types",
        lambda _ctx: mock_types,
    )

    # Test multiple times to account for randomness
    for _ in range(5):
        items = module.generate_random_items(ctx, min_items=2, max_items=5, seed=42)
        assert 2 <= len(items) <= 5, f"Expected 2-5 items, got {len(items)}"


def test_generate_random_items_has_correct_structure(monkeypatch):
    """Test that generated items have required fields."""
    ctx = SimpleNamespace(team_id=7)

    mock_types = [
        MockItemType(
            id=10,
            name="test-Vintage Chairs & Seating",
            properties=[
                MockItemProperty("test-Condition", "select", ["Good", "Fair"]),
                MockItemProperty("test-Color", "text"),
                MockItemProperty("test-Material", "select", ["Wood"]),
            ],
        ),
    ]

    monkeypatch.setattr(module, "_load_available_item_types", lambda _ctx: mock_types)

    items = module.generate_random_items(ctx, min_items=1, max_items=1, seed=42)

    assert len(items) == 1
    item = items[0]

    # Verify required fields
    assert "article_number" in item
    assert "item_type" in item
    assert "quantity" in item
    assert "weight" in item
    assert "dimension_depth" in item
    assert "dimension_width" in item
    assert "dimension_height" in item
    assert "properties" in item

    assert isinstance(item["quantity"], int)
    assert isinstance(item["weight"], int)
    assert isinstance(item["dimension_depth"], int)
    assert isinstance(item["properties"], dict)


def test_generate_random_items_uses_custom_seed(monkeypatch):
    """Test that seed parameter produces reproducible results."""
    ctx = SimpleNamespace(team_id=7)

    mock_types = [
        MockItemType(
            id=1,
            name="test-Chairs",
            properties=[MockItemProperty("test-Color", "text")],
        ),
    ]

    monkeypatch.setattr(module, "_load_available_item_types", lambda _ctx: mock_types)

    # Generate with same seed twice
    items1 = module.generate_random_items(ctx, min_items=3, max_items=8, seed=123)
    items2 = module.generate_random_items(ctx, min_items=3, max_items=8, seed=123)

    # Should produce same quantity and values
    assert len(items1) == len(items2)
    assert items1[0]["quantity"] == items2[0]["quantity"]
    assert items1[0]["weight"] == items2[0]["weight"]


def test_generate_random_items_returns_empty_when_no_types(monkeypatch):
    """Test that empty list is returned when no item types available."""
    ctx = SimpleNamespace(team_id=7)

    monkeypatch.setattr(module, "_load_available_item_types", lambda _ctx: [])

    items = module.generate_random_items(ctx)

    assert items == []


def test_generate_random_items_selects_random_properties(monkeypatch):
    """Test that random properties are selected from item type."""
    ctx = SimpleNamespace(team_id=7)

    # Create type with 5 properties
    properties = [
        MockItemProperty(f"test-Property{i}", "text") for i in range(5)
    ]

    mock_types = [
        MockItemType(
            id=1,
            name="test-StorageBox",
            properties=properties,
        ),
    ]

    monkeypatch.setattr(module, "_load_available_item_types", lambda _ctx: mock_types)

    items = module.generate_random_items(ctx, min_items=1, max_items=1, seed=42)

    assert len(items) == 1
    assert len(items[0]["properties"]) >= 1
    assert len(items[0]["properties"]) <= 3  # Max 3 properties per item


def test_generate_random_items_respects_custom_ranges(monkeypatch):
    """Test that custom ranges are respected for quantity/weight/dimensions."""
    ctx = SimpleNamespace(team_id=7)

    mock_types = [
        MockItemType(
            id=1,
            name="test-Chairs",
            properties=[MockItemProperty("test-Color", "text")],
        ),
    ]

    monkeypatch.setattr(module, "_load_available_item_types", lambda _ctx: mock_types)

    custom_ranges = {
        "test-Chairs": ItemTypeRanges(
            item_type_name="test-Chairs",
            min_quantity=5,
            max_quantity=5,  # Fixed at 5
            min_weight_kg=10.0,
            max_weight_kg=10.0,  # Fixed at 10kg
            min_length_cm=50.0,
            max_length_cm=50.0,  # Fixed at 50cm
        ),
    }

    items = module.generate_random_items(
        ctx,
        min_items=1,
        max_items=1,
        ranges_map=custom_ranges,
        seed=42,
    )

    assert items[0]["quantity"] == 5
    assert items[0]["weight"] == 10000
    assert items[0]["dimension_depth"] == 50


def test_generate_property_value_handles_select_type(monkeypatch):
    """Test property value generation for select field type."""
    prop = MockItemProperty("test-Condition", "select", ["Good", "Fair", "Poor"])

    value = module._generate_property_value(prop)

    assert value in ["Good", "Fair", "Poor"]


def test_generate_property_value_handles_select_type_legacy_object_format():
    """Legacy select options format with values object remains supported."""
    prop = MockItemProperty("test-Condition", "select", {"values": ["Good", "Fair", "Poor"]})

    value = module._generate_property_value(prop)

    assert value in ["Good", "Fair", "Poor"]


def test_generate_property_value_handles_checkbox_type():
    """Test property value generation for checkbox field type."""
    prop = MockItemProperty("test-Fragile", "check_box")

    value = module._generate_property_value(prop)

    assert isinstance(value, bool)


def test_generate_property_value_handles_number_type():
    """Test property value generation for number field type."""
    prop = MockItemProperty("test-Count", "number")

    value = module._generate_property_value(prop)

    assert isinstance(value, int)
    assert 1 <= value <= 100


def test_generate_property_value_handles_text_type():
    """Test property value generation for text field type."""
    prop = MockItemProperty("test-Color", "text")

    value = module._generate_property_value(prop)

    assert isinstance(value, str)
    assert len(value) > 0
