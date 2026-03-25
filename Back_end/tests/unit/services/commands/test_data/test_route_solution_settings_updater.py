from types import SimpleNamespace

import pytest

from Delivery_app_BK.services.commands.test_data import route_solution_settings_updater as module
from Delivery_app_BK.services.commands.test_data.config.route_solution_update_defaults import (
    DEFAULT_ETA_TOLERANCE_MINUTES,
    DEFAULT_ROUTE_SOLUTION_SET_END_TIME,
    DEFAULT_ROUTE_SOLUTION_SET_START_TIME,
    DEFAULT_ROUTE_SOLUTION_START_LOCATION,
    DEFAULT_SERVICE_TIME_PER_ITEM_MINUTES,
    DEFAULT_SERVICE_TIME_PER_ORDER_MINUTES,
)


class _DummyTransaction:
    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc, tb):
        return False


def _build_ctx(incoming_data=None, user_id=None):
    return SimpleNamespace(
        incoming_data=incoming_data or {},
        identity={"team_id": 5, "active_team_id": 5, "user_id": user_id},
        user_id=user_id,
    )


def _make_route_solution():
    rs = SimpleNamespace(
        id=1,
        driver_id=None,
        set_start_time=None,
        set_end_time=None,
        start_location=None,
        stops_service_time=None,
        eta_tolerance_seconds=None,
    )
    return rs


# ---------------------------------------------------------------------------
# _parse_settings
# ---------------------------------------------------------------------------

def test_parse_settings_returns_all_defaults_when_no_overrides():
    ctx = _build_ctx(user_id=99)
    settings = module._parse_settings({}, ctx)

    assert settings["set_start_time"] == DEFAULT_ROUTE_SOLUTION_SET_START_TIME
    assert settings["set_end_time"] == DEFAULT_ROUTE_SOLUTION_SET_END_TIME
    assert settings["start_location"] == DEFAULT_ROUTE_SOLUTION_START_LOCATION
    assert settings["service_time_per_order_minutes"] == DEFAULT_SERVICE_TIME_PER_ORDER_MINUTES
    assert settings["service_time_per_item_minutes"] == DEFAULT_SERVICE_TIME_PER_ITEM_MINUTES
    assert settings["eta_tolerance_minutes"] == DEFAULT_ETA_TOLERANCE_MINUTES
    assert settings["driver_id"] == 99


def test_parse_settings_driver_id_uses_ctx_user_id_when_not_overridden():
    ctx = _build_ctx(user_id=42)
    settings = module._parse_settings({}, ctx)
    assert settings["driver_id"] == 42


def test_parse_settings_driver_id_can_be_overridden():
    ctx = _build_ctx(user_id=99)
    settings = module._parse_settings({"driver_id": 7}, ctx)
    assert settings["driver_id"] == 7


def test_parse_settings_overrides_time_fields():
    ctx = _build_ctx(user_id=1)
    settings = module._parse_settings(
        {"set_start_time": "08:00", "set_end_time": "17:30"},
        ctx,
    )
    assert settings["set_start_time"] == "08:00"
    assert settings["set_end_time"] == "17:30"


def test_parse_settings_overrides_service_time_and_tolerance():
    ctx = _build_ctx(user_id=1)
    settings = module._parse_settings(
        {
            "service_time_per_order_minutes": 5,
            "service_time_per_item_minutes": 2,
            "eta_tolerance_minutes": 15,
        },
        ctx,
    )
    assert settings["service_time_per_order_minutes"] == 5
    assert settings["service_time_per_item_minutes"] == 2
    assert settings["eta_tolerance_minutes"] == 15


def test_parse_settings_ignores_non_dict_start_location():
    ctx = _build_ctx(user_id=1)
    settings = module._parse_settings({"start_location": "bad_value"}, ctx)
    # Non-dict start_location should be ignored; default remains
    assert settings["start_location"] == DEFAULT_ROUTE_SOLUTION_START_LOCATION


# ---------------------------------------------------------------------------
# _apply_settings
# ---------------------------------------------------------------------------

def test_apply_settings_sets_all_fields_correctly():
    rs = _make_route_solution()
    settings = {
        "driver_id": 10,
        "set_start_time": "09:00",
        "set_end_time": "16:00",
        "start_location": {"city": "Stockholm"},
        "service_time_per_order_minutes": 3,
        "service_time_per_item_minutes": 1,
        "eta_tolerance_minutes": 30,
    }
    module._apply_settings(rs, settings)

    assert rs.driver_id == 10
    assert rs.set_start_time == "09:00"
    assert rs.set_end_time == "16:00"
    assert rs.start_location == {"city": "Stockholm"}
    assert rs.stops_service_time == {"time": 180, "per_item": 60}
    assert rs.eta_tolerance_seconds == 1800


def test_apply_settings_converts_minutes_to_seconds():
    rs = _make_route_solution()
    settings = {
        "driver_id": None,
        "set_start_time": "09:00",
        "set_end_time": "16:00",
        "start_location": None,
        "service_time_per_order_minutes": 5,
        "service_time_per_item_minutes": 2,
        "eta_tolerance_minutes": 60,
    }
    module._apply_settings(rs, settings)

    assert rs.stops_service_time == {"time": 300, "per_item": 120}
    assert rs.eta_tolerance_seconds == 3600


# ---------------------------------------------------------------------------
# update_route_solutions_settings
# ---------------------------------------------------------------------------

def test_update_skips_non_local_delivery_plans(monkeypatch):
    ctx = _build_ctx(user_id=1)
    plan_result = {
        "created": [
            {"plan_type": "store_pickup", "route_solution_ids": [10]},
            {"plan_type": "international_shipping", "route_solution_ids": [20]},
        ]
    }

    get_calls = []
    fake_db = SimpleNamespace(
        session=SimpleNamespace(
            begin=lambda: _DummyTransaction(),
            get=lambda model, id_: get_calls.append(id_) or None,
        )
    )
    monkeypatch.setattr(module, "db", fake_db)

    result = module.update_route_solutions_settings(ctx, plan_result)

    assert result["updated_count"] == 0
    assert result["updated_ids"] == []
    assert get_calls == [], "db.session.get should not be called for non-local plans"


def test_update_applies_settings_to_local_delivery_route_solutions(monkeypatch):
    ctx = _build_ctx(user_id=55)
    rs1 = _make_route_solution()
    rs1.id = 101
    rs2 = _make_route_solution()
    rs2.id = 102

    store = {101: rs1, 102: rs2}
    plan_result = {
        "created": [
            {"plan_type": "local_delivery", "route_solution_ids": [101, 102]},
        ]
    }

    fake_db = SimpleNamespace(
        session=SimpleNamespace(
            begin=lambda: _DummyTransaction(),
            get=lambda _model, rs_id: store.get(rs_id),
        )
    )
    monkeypatch.setattr(module, "db", fake_db)

    result = module.update_route_solutions_settings(ctx, plan_result)

    assert result["updated_count"] == 2
    assert result["updated_ids"] == [101, 102]
    assert result["skipped_ids"] == []

    for rs in (rs1, rs2):
        assert rs.driver_id == 55
        assert rs.set_start_time == DEFAULT_ROUTE_SOLUTION_SET_START_TIME
        assert rs.set_end_time == DEFAULT_ROUTE_SOLUTION_SET_END_TIME
        assert rs.start_location == DEFAULT_ROUTE_SOLUTION_START_LOCATION
        assert rs.stops_service_time == {
            "time": DEFAULT_SERVICE_TIME_PER_ORDER_MINUTES * 60,
            "per_item": DEFAULT_SERVICE_TIME_PER_ITEM_MINUTES * 60,
        }
        assert rs.eta_tolerance_seconds == DEFAULT_ETA_TOLERANCE_MINUTES * 60


def test_update_adds_missing_route_solution_to_skipped(monkeypatch):
    ctx = _build_ctx(user_id=1)
    plan_result = {
        "created": [
            {"plan_type": "local_delivery", "route_solution_ids": [999]},
        ]
    }

    fake_db = SimpleNamespace(
        session=SimpleNamespace(
            begin=lambda: _DummyTransaction(),
            get=lambda _model, _id: None,  # not found
        )
    )
    monkeypatch.setattr(module, "db", fake_db)

    result = module.update_route_solutions_settings(ctx, plan_result)

    assert result["updated_count"] == 0
    assert result["skipped_ids"] == [999]


def test_update_accepts_settings_overrides_via_incoming_data(monkeypatch):
    ctx = _build_ctx(
        incoming_data={
            "set_start_time": "08:30",
            "set_end_time": "17:00",
            "service_time_per_order_minutes": 5,
            "service_time_per_item_minutes": 2,
            "eta_tolerance_minutes": 15,
            "driver_id": 7,
        },
        user_id=99,
    )
    rs = _make_route_solution()
    rs.id = 1

    plan_result = {
        "created": [{"plan_type": "local_delivery", "route_solution_ids": [1]}]
    }

    fake_db = SimpleNamespace(
        session=SimpleNamespace(
            begin=lambda: _DummyTransaction(),
            get=lambda _model, _id: rs,
        )
    )
    monkeypatch.setattr(module, "db", fake_db)

    module.update_route_solutions_settings(ctx, plan_result)

    assert rs.driver_id == 7
    assert rs.set_start_time == "08:30"
    assert rs.set_end_time == "17:00"
    assert rs.stops_service_time == {"time": 300, "per_item": 120}
    assert rs.eta_tolerance_seconds == 900


def test_update_handles_empty_plan_result(monkeypatch):
    ctx = _build_ctx(user_id=1)

    fake_db = SimpleNamespace(
        session=SimpleNamespace(
            begin=lambda: _DummyTransaction(),
            get=lambda _model, _id: None,
        )
    )
    monkeypatch.setattr(module, "db", fake_db)

    result = module.update_route_solutions_settings(ctx, {"created": []})

    assert result["updated_count"] == 0
    assert result["updated_ids"] == []
    assert result["skipped_ids"] == []


def test_update_mixes_local_and_non_local_plans(monkeypatch):
    """Mixed plan types: only local delivery route solutions get updated."""
    ctx = _build_ctx(user_id=3)
    rs_local = _make_route_solution()
    rs_local.id = 10

    plan_result = {
        "created": [
            {"plan_type": "store_pickup", "route_solution_ids": []},
            {"plan_type": "local_delivery", "route_solution_ids": [10]},
            {"plan_type": "international_shipping", "route_solution_ids": []},
        ]
    }

    fake_db = SimpleNamespace(
        session=SimpleNamespace(
            begin=lambda: _DummyTransaction(),
            get=lambda _model, rs_id: rs_local if rs_id == 10 else None,
        )
    )
    monkeypatch.setattr(module, "db", fake_db)

    result = module.update_route_solutions_settings(ctx, plan_result)

    assert result["updated_count"] == 1
    assert result["updated_ids"] == [10]
    assert rs_local.driver_id == 3
