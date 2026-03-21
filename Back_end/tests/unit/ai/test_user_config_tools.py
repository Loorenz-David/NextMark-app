from Delivery_app_BK.ai.tools import user_config_tools
from Delivery_app_BK.services.context import ServiceContext


def test_list_item_types_config_tool_passes_filters(monkeypatch):
    captured = {}

    def _fake_list_item_types_service(ctx):
        captured["query_params"] = dict(ctx.query_params)
        return {
            "item_types": [{"id": 1, "name": "table", "properties": [11, 12]}],
            "item_types_pagination": {"has_more": False},
        }

    monkeypatch.setattr(user_config_tools, "list_item_types_service", _fake_list_item_types_service)

    ctx = ServiceContext(query_params={"existing": "keep"})
    result = user_config_tools.list_item_types_config_tool(ctx, name="tab", limit=20, sort="id_asc")

    assert captured["query_params"]["existing"] == "keep"
    assert captured["query_params"]["name"] == "tab"
    assert captured["query_params"]["limit"] == 20
    assert captured["query_params"]["sort"] == "id_asc"
    assert result["count"] == 1
    assert result["item_types"][0]["name"] == "table"


def test_link_properties_to_item_type_tool_merges_existing_ids(monkeypatch):
    captured = {}

    monkeypatch.setattr(
        user_config_tools,
        "get_item_type_service",
        lambda item_type_id, ctx: {"item_type": {"id": item_type_id, "properties": [10, 11]}},
    )

    def _fake_update_item_type_config_tool(ctx, item_type_id, fields):
        captured["item_type_id"] = item_type_id
        captured["fields"] = fields
        return {"status": "updated"}

    monkeypatch.setattr(user_config_tools, "update_item_type_config_tool", _fake_update_item_type_config_tool)

    ctx = ServiceContext()
    result = user_config_tools.link_properties_to_item_type_tool(ctx, item_type_id=5, property_ids=[11, 12], merge=True)

    assert captured["item_type_id"] == 5
    assert captured["fields"]["properties"] == [10, 11, 12]
    assert result["status"] == "updated"


def test_create_item_property_config_tool_builds_fields(monkeypatch):
    captured = {}

    def _fake_create_item_property_service(ctx):
        captured["incoming_data"] = dict(ctx.incoming_data)
        return {
            "item_property": [
                {
                    "id": 7,
                    "name": "material",
                    "field_type": "select",
                    "options": ["oak", "pine"],
                    "required": True,
                }
            ]
        }

    monkeypatch.setattr(user_config_tools, "create_item_property_service", _fake_create_item_property_service)

    ctx = ServiceContext()
    result = user_config_tools.create_item_property_config_tool(
        ctx,
        name="material",
        field_type="select",
        required=True,
        options=["oak", "pine"],
        item_type_ids=[1, 2],
    )

    fields = captured["incoming_data"]["fields"]
    assert fields["name"] == "material"
    assert fields["field_type"] == "select"
    assert fields["required"] is True
    assert fields["options"] == ["oak", "pine"]
    assert fields["item_types"] == [1, 2]
    assert result["status"] == "created"
    assert result["item_property"]["id"] == 7