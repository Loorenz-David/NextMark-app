from contextlib import contextmanager
from datetime import datetime, timezone
from types import SimpleNamespace

import pytest

from Delivery_app_BK.errors import ValidationFailed
from Delivery_app_BK.services.commands.route_plan import create_plan as module
from Delivery_app_BK.services.context import ServiceContext


@contextmanager
def _noop_transaction():
    yield


def _ctx(fields):
    return ServiceContext(
        incoming_data={"fields": [fields]},
        identity={"active_team_id": 1},
    )


def test_create_plan_without_zone_ids_creates_plan_only(monkeypatch):
    added_batches = []

    monkeypatch.setattr(module.db.session, "begin", _noop_transaction)
    monkeypatch.setattr(module.db.session, "add_all", lambda rows: added_batches.append(list(rows)))
    monkeypatch.setattr(module.db.session, "flush", lambda: None)
    monkeypatch.setattr(module, "emit_order_events", lambda *args, **kwargs: None)
    monkeypatch.setattr(module, "emit_route_solution_created", lambda *args, **kwargs: None)
    monkeypatch.setattr(module, "notify_delivery_planning_event", lambda *args, **kwargs: None)
    monkeypatch.setattr(module, "serialize_created_route_plan", lambda plan: {"id": plan.id})

    def _fake_create_instance(_ctx, model, fields):
        if model is module.RoutePlan:
            return SimpleNamespace(
                id=101,
                team_id=1,
                created_at=datetime.now(timezone.utc),
                updated_at=datetime.now(timezone.utc),
                **fields,
            )
        raise AssertionError("Unexpected model create")

    monkeypatch.setattr(module, "create_instance", _fake_create_instance)

    result = module.create_plan(_ctx({"label": "No Zones", "start_date": "2026-04-01"}))

    assert len(result["created"]) == 1
    assert result["created"][0]["delivery_plan"]["id"] == 101
    assert "route_groups" not in result["created"][0]
    assert all(not any(hasattr(row, "zone_id") for row in batch) for batch in added_batches)


def test_create_plan_with_zone_ids_returns_route_groups_bundle(monkeypatch):
    recomputed_plan_ids = []

    monkeypatch.setattr(module.db.session, "begin", _noop_transaction)
    monkeypatch.setattr(module.db.session, "add_all", lambda rows: None)
    monkeypatch.setattr(module.db.session, "flush", lambda: None)
    monkeypatch.setattr(module, "emit_order_events", lambda *args, **kwargs: None)
    monkeypatch.setattr(module, "emit_route_solution_created", lambda *args, **kwargs: None)
    monkeypatch.setattr(module, "notify_delivery_planning_event", lambda *args, **kwargs: None)
    monkeypatch.setattr(module, "serialize_created_route_plan", lambda plan: {"id": plan.id})
    monkeypatch.setattr(module, "serialize_created_route_group", lambda rg: {"id": rg.id, "zone_id": rg.zone_id})
    monkeypatch.setattr(module, "serialize_created_route_solution", lambda rs: {"id": rs.id})
    monkeypatch.setattr(module, "recompute_route_group_totals", lambda plan: recomputed_plan_ids.append(plan.id))
    monkeypatch.setattr(module, "_find_created_route_solutions", lambda extra_instances: list(extra_instances))

    def _fake_create_instance(_ctx, model, fields):
        if model is module.RoutePlan:
            return SimpleNamespace(
                id=201,
                team_id=1,
                created_at=datetime.now(timezone.utc),
                updated_at=datetime.now(timezone.utc),
                **fields,
            )
        raise AssertionError("Unexpected model create")

    monkeypatch.setattr(module, "create_instance", _fake_create_instance)

    rg_1 = SimpleNamespace(id=301, zone_id=3)
    rg_2 = SimpleNamespace(id=302, zone_id=7)
    rs_1 = SimpleNamespace(id=401)
    rs_2 = SimpleNamespace(id=402)
    monkeypatch.setattr(
        module,
        "_build_zone_route_group_instances",
        lambda **kwargs: ([rg_1, rg_2], [rs_1, rs_2]),
    )

    result = module.create_plan(
        _ctx({"label": "With Zones", "start_date": "2026-04-01", "zone_ids": [3, 7]})
    )

    bundle = result["created"][0]
    assert [group["zone_id"] for group in bundle["route_groups"]] == [3, 7]
    assert [solution["id"] for solution in bundle["route_solutions"]] == [401, 402]
    assert recomputed_plan_ids == [201]


def test_load_active_zones_raises_for_invalid_zone_ids(monkeypatch):
    monkeypatch.setattr(
        module,
        "_load_active_zones",
        lambda *_args, **_kwargs: (_ for _ in ()).throw(
            ValidationFailed("Invalid zone_ids for this team: [99]")
        ),
    )

    with pytest.raises(ValidationFailed, match="Invalid zone_ids"):
        module._build_zone_route_group_instances(
            ctx=ServiceContext(incoming_data={}, identity={"active_team_id": 1}),
            route_plan_instance=SimpleNamespace(id=1, start_date=datetime.now(timezone.utc)),
            zone_ids=[3, 99],
            route_group_defaults={},
        )
