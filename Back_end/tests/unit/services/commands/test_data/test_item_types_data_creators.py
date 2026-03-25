from types import SimpleNamespace

import pytest

from Delivery_app_BK.errors import ValidationFailed
from Delivery_app_BK.services.commands.test_data import item_types_data_creators as module


def test_generate_item_types_test_data_creates_properties_and_types(monkeypatch):
    """Test that item types and properties are created and properly linked."""
    captured_property_fields = []
    captured_type_fields = []

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
        warnings=[],
    )

    def _fake_create_item_property(create_ctx):
        fields = create_ctx.incoming_data.get("fields") or []
        captured_property_fields.extend(fields)
        # Return created properties with IDs
        return {
            "created": [
                {
                    "id": idx + 100,
                    "name": field["name"],
                    "field_type": field.get("field_type", "text"),
                }
                for idx, field in enumerate(fields)
            ],
        }

    def _fake_create_item_type(create_ctx):
        fields = create_ctx.incoming_data.get("fields") or []
        captured_type_fields.extend(fields)
        # Return created types
        return {
            "created": [
                {
                    "id": idx + 200,
                    "name": field["name"],
                    "properties": field.get("properties", []),
                }
                for idx, field in enumerate(fields)
            ],
        }

    monkeypatch.setattr(module, "create_item_property", _fake_create_item_property)
    monkeypatch.setattr(module, "create_item_type", _fake_create_item_type)

    result = module.generate_item_types_test_data(ctx)

    # Verify counts
    assert result["properties_count"] == 10  # Default has 10 properties
    assert result["types_count"] == 5  # Default has 5 types

    # Verify all created properties have test- prefix
    property_names = [prop["name"] for prop in result["created_properties"]]
    assert all("test-" in name for name in property_names), (
        "All properties should have 'test-' prefix"
    )

    # Verify all created types have test- prefix
    type_names = [t["name"] for t in result["created_types"]]
    assert all("test-" in name for name in type_names), "All types should have 'test-' prefix"

    # Verify types have properties linked
    assert result["property_type_links"] > 0, "Types should have properties linked"

    # Check specific type linkages
    chairs_type = next((t for t in result["created_types"] if "Chairs" in t["name"]), None)
    assert chairs_type is not None, "Chairs type should be created"
    assert len(chairs_type.get("properties", [])) >= 2, "Each type should have at least 2 properties"


def test_generate_item_types_test_data_rejects_invalid_property_overrides():
    """Test that invalid property overrides are rejected."""
    ctx = SimpleNamespace(
        incoming_data={"item_properties": "not_a_list"},
        identity={},
    )

    with pytest.raises(ValidationFailed, match="item_properties must be a list"):
        module.generate_item_types_test_data(ctx)


def test_generate_item_types_test_data_rejects_invalid_type_overrides():
    """Test that invalid type overrides are rejected."""
    ctx = SimpleNamespace(
        incoming_data={"item_types": "not_a_list"},
        identity={},
    )

    with pytest.raises(ValidationFailed, match="item_types must be a list"):
        module.generate_item_types_test_data(ctx)


def test_generate_item_types_test_data_default_property_structure():
    """Test that default properties have correct structure."""
    from Delivery_app_BK.services.commands.test_data.config import (
        build_default_item_properties,
    )

    properties = build_default_item_properties()

    assert len(properties) == 10, "Should have 10 default properties"

    # Verify property structure
    for prop in properties:
        assert "name" in prop, "Property must have name"
        assert "field_type" in prop, "Property must have field_type"
        assert "required" in prop, "Property must have required"
        assert "test-" in prop["name"], "Property name should have test- prefix"

        # Verify field types are valid
        valid_field_types = {"text", "number", "select", "check_box"}
        assert (
            prop["field_type"] in valid_field_types
        ), f"Invalid field_type: {prop['field_type']}"


def test_generate_item_types_test_data_default_type_structure():
    """Test that default types have correct structure."""
    from Delivery_app_BK.services.commands.test_data.config import (
        build_default_item_types,
    )

    types = build_default_item_types()

    assert len(types) == 5, "Should have 5 default types"

    # Verify type structure
    for item_type in types:
        assert "name" in item_type, "Type must have name"
        assert "property_names" in item_type, "Type must have property_names"
        assert "test-" in item_type["name"], "Type name should have test- prefix"
        assert len(item_type["property_names"]) >= 2, "Each type should have at least 2 properties"

    # Verify types
    type_names = [t["name"] for t in types]
    assert any("Chairs" in name for name in type_names), "Should have Chairs type"
    assert any("Tables" in name for name in type_names), "Should have Tables type"
    assert any("Storage" in name for name in type_names), "Should have Storage type"
    assert any("Sofas" in name for name in type_names), "Should have Sofas type"
    assert any("Decorative" in name for name in type_names), "Should have Decorative type"


def test_generate_item_types_test_data_is_idempotent_when_defaults_already_exist(monkeypatch):
    """When rows already exist, generator should reuse them and not create duplicates."""
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
        warnings=[],
    )

    from Delivery_app_BK.services.commands.test_data.config import (
        build_default_item_properties,
        build_default_item_types,
    )

    default_properties = build_default_item_properties()
    default_types = build_default_item_types()

    property_names = [item["name"] for item in default_properties]
    type_names = [item["name"] for item in default_types]

    existing_properties = {
        name: SimpleNamespace(id=100 + i, name=name, field_type="text")
        for i, name in enumerate(property_names)
    }

    property_ids_by_name = {name: row.id for name, row in existing_properties.items()}

    existing_types = {}
    for i, t_name in enumerate(type_names):
        property_ids = [
            property_ids_by_name[p_name]
            for p_name in default_types[i].get("property_names", [])
            if p_name in property_ids_by_name
        ]
        existing_types[t_name] = SimpleNamespace(
            id=200 + i,
            name=t_name,
            properties=[SimpleNamespace(id=p_id) for p_id in property_ids],
        )

    monkeypatch.setattr(module, "_load_item_properties_by_name", lambda *_args, **_kwargs: existing_properties)
    monkeypatch.setattr(module, "_load_item_types_by_name", lambda *_args, **_kwargs: existing_types)
    monkeypatch.setattr(module, "_load_item_properties_by_id", lambda *_args, **_kwargs: {
        row.id: row for row in existing_properties.values()
    })

    create_property_called = False
    create_type_called = False

    def _fail_create_property(_ctx):
        nonlocal create_property_called
        create_property_called = True
        return {"created": []}

    def _fail_create_type(_ctx):
        nonlocal create_type_called
        create_type_called = True
        return {"created": []}

    monkeypatch.setattr(module, "create_item_property", _fail_create_property)
    monkeypatch.setattr(module, "create_item_type", _fail_create_type)

    class _NoopSession:
        @staticmethod
        def flush():
            return None

    monkeypatch.setattr(module, "db", SimpleNamespace(session=_NoopSession()))

    result = module.generate_item_types_test_data(ctx)

    assert create_property_called is False
    assert create_type_called is False
    assert result["properties_count"] == len(default_properties)
    assert result["types_count"] == len(default_types)
