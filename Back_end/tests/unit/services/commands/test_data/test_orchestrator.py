from types import SimpleNamespace

import pytest

from Delivery_app_BK.errors import ValidationFailed
from Delivery_app_BK.services.commands.test_data import orchestrator as module


def _build_ctx(incoming_data):
    return SimpleNamespace(
        incoming_data=incoming_data,
        incoming_file=None,
        query_params={},
        identity={"team_id": 5, "active_team_id": 5},
        check_team_id=True,
        inject_team_id=True,
        skip_id_instance_injection=True,
        relationship_map={},
        on_create_return="map_ids_object",
        on_query_return="client_ids_map",
        allow_is_system_modification=False,
        extract_fields_key=True,
        prevent_event_bus=False,
    )


def test_orchestrator_runs_plan_then_order_with_nested_payload(monkeypatch):
    ctx = _build_ctx(
        {
            "item_types_data": {},
            "plan_data": {"plans": [{"delivery_plan": {"plan_type": "local_delivery"}}]},
            "order_data": {"orders_by_plan_type": {"local_delivery": []}},
        }
    )

    calls = []
    fake_plan_result = {"count": 5, "created": []}

    def _fake_item_types(item_types_ctx):
        calls.append(("item_types", item_types_ctx.incoming_data))
        return {"properties_count": 10, "types_count": 5, "created_properties": [], "created_types": []}

    def _fake_plan(plan_ctx):
        calls.append(("plan", plan_ctx.incoming_data))
        return fake_plan_result

    def _fake_rs_update(rs_ctx, plan_result):
        calls.append(("route_solution_update", rs_ctx.incoming_data))
        assert plan_result is fake_plan_result
        return {"updated_count": 3, "updated_ids": [1, 2, 3], "skipped_ids": []}

    def _fake_order(order_ctx):
        calls.append(("order", order_ctx.incoming_data))
        return {"count": 15, "created": []}

    monkeypatch.setattr(module, "generate_item_types_test_data", _fake_item_types)
    monkeypatch.setattr(module, "generate_plan_test_data", _fake_plan)
    monkeypatch.setattr(module, "update_route_solutions_settings", _fake_rs_update)
    monkeypatch.setattr(module, "generate_order_test_data", _fake_order)

    result = module.generate_plan_and_order_test_data(ctx)

    assert [entry[0] for entry in calls] == ["item_types", "plan", "route_solution_update", "order"]
    assert calls[0][1] == {}
    assert calls[1][1] == {"plans": [{"delivery_plan": {"plan_type": "local_delivery"}}]}
    assert calls[2][1] == {}  # no route_solution_settings_data in incoming
    assert calls[3][1] == {"orders_by_plan_type": {"local_delivery": []}}
    assert result["summary"] == {
        "created_properties": 10,
        "created_item_types": 5,
        "created_plans": 5,
        "updated_route_solutions": 3,
        "created_orders": 15,
    }


def test_orchestrator_accepts_top_level_compatibility_keys(monkeypatch):
    ctx = _build_ctx(
        {
            "item_types": [],
            "item_properties": [],
            "plans": [{"delivery_plan": {"plan_type": "store_pickup"}}],
            "orders_by_plan_type": {"store_pickup": []},
        }
    )

    observed = {}

    def _fake_item_types(item_types_ctx):
        observed["item_types_data"] = item_types_ctx.incoming_data
        return {"properties_count": 0, "types_count": 0}

    def _fake_plan(plan_ctx):
        observed["plan_data"] = plan_ctx.incoming_data
        return {"count": 1, "created": []}

    def _fake_rs_update(rs_ctx, plan_result):
        observed["rs_settings_data"] = rs_ctx.incoming_data
        return {"updated_count": 0, "updated_ids": [], "skipped_ids": []}

    def _fake_order(order_ctx):
        observed["order_data"] = order_ctx.incoming_data
        return {"count": 5}

    monkeypatch.setattr(module, "generate_item_types_test_data", _fake_item_types)
    monkeypatch.setattr(module, "generate_plan_test_data", _fake_plan)
    monkeypatch.setattr(module, "update_route_solutions_settings", _fake_rs_update)
    monkeypatch.setattr(module, "generate_order_test_data", _fake_order)

    result = module.generate_plan_and_order_test_data(ctx)

    assert observed["item_types_data"] == {"item_types": [], "item_properties": []}
    assert observed["plan_data"] == {"plans": [{"delivery_plan": {"plan_type": "store_pickup"}}]}
    assert observed["rs_settings_data"] == {}
    assert observed["order_data"] == {"orders_by_plan_type": {"store_pickup": []}}
    assert result["summary"] == {
        "created_properties": 0,
        "created_item_types": 0,
        "created_plans": 1,
        "updated_route_solutions": 0,
        "created_orders": 5,
    }


def test_orchestrator_rejects_invalid_nested_payload_types():
    ctx = _build_ctx({"item_types_data": [], "plan_data": [], "order_data": {}})

    with pytest.raises(ValidationFailed, match="item_types_data must be an object"):
        module.generate_plan_and_order_test_data(ctx)


def test_orchestrator_passes_route_solution_settings_data_to_updater(monkeypatch):
    """route_solution_settings_data is forwarded to update_route_solutions_settings."""
    ctx = _build_ctx(
        {
            "route_solution_settings_data": {
                "set_start_time": "08:00",
                "eta_tolerance_minutes": 15,
            }
        }
    )

    observed_rs_data = {}
    fake_plan_result = {"count": 2, "created": []}

    def _fake_item_types(c):
        return {"properties_count": 0, "types_count": 0}

    def _fake_plan(c):
        return fake_plan_result

    def _fake_rs_update(rs_ctx, plan_result):
        observed_rs_data["incoming"] = rs_ctx.incoming_data
        return {"updated_count": 0, "updated_ids": [], "skipped_ids": []}

    def _fake_order(c):
        return {"count": 0}

    monkeypatch.setattr(module, "generate_item_types_test_data", _fake_item_types)
    monkeypatch.setattr(module, "generate_plan_test_data", _fake_plan)
    monkeypatch.setattr(module, "update_route_solutions_settings", _fake_rs_update)
    monkeypatch.setattr(module, "generate_order_test_data", _fake_order)

    module.generate_plan_and_order_test_data(ctx)

    assert observed_rs_data["incoming"] == {
        "set_start_time": "08:00",
        "eta_tolerance_minutes": 15,
    }


def test_orchestrator_rejects_invalid_route_solution_settings_data_type():
    ctx = _build_ctx({"route_solution_settings_data": "not_a_dict"})

    with pytest.raises(ValidationFailed, match="route_solution_settings_data must be an object"):
        module.generate_plan_and_order_test_data(ctx)