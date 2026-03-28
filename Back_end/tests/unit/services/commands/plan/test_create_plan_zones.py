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


def _stub_no_zone_group():
    return SimpleNamespace(id=501, zone_id=None)


def _stub_no_zone_solution():
    return SimpleNamespace(id=601)


def _parsed_request(label="No Zones", zone_ids=None, order_ids=None):
    """Return a stub parsed plan request without touching the DB."""
    return SimpleNamespace(
        client_id=None,          # suppress the existing-plan lookup
        label=label,
        start_date="2026-04-01",
        end_date=None,
        date_strategy=None,
        zone_ids=zone_ids or [],
        order_ids=order_ids or [],
        route_group_defaults={},
    )


def _patch_common(monkeypatch, zone_ids=None, order_ids=None):
    """Minimal patches shared across creation tests."""
    monkeypatch.setattr(module.db.session, "begin", _noop_transaction)
    monkeypatch.setattr(module.db.session, "add_all", lambda rows: None)
    monkeypatch.setattr(module.db.session, "flush", lambda: None)
    monkeypatch.setattr(module, "emit_order_events", lambda *a, **kw: None)
    monkeypatch.setattr(module, "emit_route_solution_created", lambda *a, **kw: None)
    monkeypatch.setattr(module, "notify_delivery_planning_event", lambda *a, **kw: None)
    monkeypatch.setattr(module, "recompute_route_group_totals", lambda plan: None)
    monkeypatch.setattr(module, "serialize_created_route_plan", lambda plan: {"id": plan.id})
    monkeypatch.setattr(
        module, "serialize_created_route_group",
        lambda rg: {"id": rg.id, "zone_id": rg.zone_id},
    )
    monkeypatch.setattr(
        module, "serialize_created_route_solution",
        lambda rs: {"id": rs.id},
    )
    monkeypatch.setattr(
        module, "_find_created_route_solutions",
        lambda extra_instances: list(extra_instances),
    )
    monkeypatch.setattr(
        module, "parse_create_plan_request",
        lambda field_set: _parsed_request(zone_ids=zone_ids, order_ids=order_ids),
    )


def _fake_plan_create_instance(_ctx, model, fields):
    if model is module.RoutePlan:
        return SimpleNamespace(
            id=101,
            team_id=1,
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc),
            **fields,
        )
    raise AssertionError(f"Unexpected model: {model}")


# ---------------------------------------------------------------------------
# No Zone group is always bootstrapped
# ---------------------------------------------------------------------------

def test_create_plan_without_zone_ids_always_creates_no_zone_group(monkeypatch):
    """A plan with no zone_ids must still get exactly one No-Zone route group."""
    _patch_common(monkeypatch)
    monkeypatch.setattr(module, "create_instance", _fake_plan_create_instance)
    monkeypatch.setattr(
        module,
        "_build_no_zone_route_group_instance",
        lambda **kw: (_stub_no_zone_group(), _stub_no_zone_solution()),
    )

    result = module.create_plan(_ctx({"label": "No Zones", "start_date": "2026-04-01"}))

    assert len(result["created"]) == 1
    bundle = result["created"][0]
    assert bundle["delivery_plan"]["id"] == 101
    # No Zone group must be present
    assert len(bundle["route_groups"]) == 1
    assert bundle["route_groups"][0]["zone_id"] is None
    # Its solution must also be serialized
    assert len(bundle["route_solutions"]) == 1
    assert bundle["route_solutions"][0]["id"] == 601


def test_create_plan_with_zone_ids_no_zone_group_appears_first(monkeypatch):
    """No-Zone group always leads the route_groups list before zone-specific groups."""
    _patch_common(monkeypatch, zone_ids=[3, 7])
    monkeypatch.setattr(module, "create_instance", _fake_plan_create_instance)

    no_zone_rg = _stub_no_zone_group()
    no_zone_rs = _stub_no_zone_solution()
    monkeypatch.setattr(
        module,
        "_build_no_zone_route_group_instance",
        lambda **kw: (no_zone_rg, no_zone_rs),
    )

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
    zone_ids_in_order = [group["zone_id"] for group in bundle["route_groups"]]
    # No Zone first, then zone-specific groups in the order they were added
    assert zone_ids_in_order == [None, 3, 7]
    solution_ids = [s["id"] for s in bundle["route_solutions"]]
    assert 601 in solution_ids
    assert 401 in solution_ids
    assert 402 in solution_ids


def test_create_plan_with_zone_ids_recomputes_totals(monkeypatch):
    recomputed_plan_ids = []

    _patch_common(monkeypatch, zone_ids=[3])
    monkeypatch.setattr(
        module, "recompute_route_group_totals",
        lambda plan: recomputed_plan_ids.append(plan.id),
    )
    monkeypatch.setattr(module, "create_instance", _fake_plan_create_instance)
    monkeypatch.setattr(
        module,
        "_build_no_zone_route_group_instance",
        lambda **kw: (_stub_no_zone_group(), _stub_no_zone_solution()),
    )
    monkeypatch.setattr(
        module,
        "_build_zone_route_group_instances",
        lambda **kwargs: ([SimpleNamespace(id=301, zone_id=3)], [SimpleNamespace(id=401)]),
    )

    module.create_plan(
        _ctx({"label": "With Zones", "start_date": "2026-04-01", "zone_ids": [3]})
    )

    assert recomputed_plan_ids == [101]


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
