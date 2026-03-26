from types import SimpleNamespace
from datetime import datetime, timedelta, timezone

import pytest

from Delivery_app_BK.errors import ValidationFailed
from Delivery_app_BK.services.commands.test_data import plan_data_creators as module


class _DummyTransaction:
    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc, tb):
        return False


def test_generate_plan_test_data_rejects_non_list_plans():
    ctx = SimpleNamespace(incoming_data={"plans": {}}, identity={})

    with pytest.raises(ValidationFailed, match="plans must be a list"):
        module.generate_plan_test_data(ctx)


def test_generate_plan_test_data_uses_expected_default_payload_mix(monkeypatch):
    ctx = SimpleNamespace(incoming_data={}, identity={})
    seen_payloads = []

    monkeypatch.setattr(module.db.session, "begin", lambda: _DummyTransaction())

    def _fake_create_plan_bundle(_ctx, payload, sequence=1):
        seen_payloads.append((payload, sequence))
        return {"route_plan_id": sequence}

    monkeypatch.setattr(module, "create_plan_bundle", _fake_create_plan_bundle)

    result = module.generate_plan_test_data(ctx)

    assert result["count"] == 5
    assert [sequence for _payload, sequence in seen_payloads] == [1, 2, 3, 4, 5]
    assert [
        payload.get("delivery_plan", {}).get("plan_type") for payload, _ in seen_payloads
    ] == [
        "local_delivery",
        "local_delivery",
        "local_delivery",
        "store_pickup",
        "international_shipping",
    ]

    today = datetime.now(timezone.utc).date()
    first_local = seen_payloads[0][0]["delivery_plan"]
    second_local = seen_payloads[1][0]["delivery_plan"]
    third_local = seen_payloads[2][0]["delivery_plan"]
    store_pickup = seen_payloads[3][0]["delivery_plan"]
    international_shipping = seen_payloads[4][0]["delivery_plan"]

    assert first_local["start_date"].date() == today
    assert first_local["end_date"].date() == today

    assert second_local["start_date"].date() == today + timedelta(days=1)
    assert second_local["end_date"].date() == today + timedelta(days=3)

    assert third_local["start_date"].date() == second_local["end_date"].date() + timedelta(days=1)
    assert third_local["end_date"].date() == second_local["end_date"].date() + timedelta(days=1)

    assert first_local["label"] == "City Pulse Same-Day Run"
    assert second_local["label"] == "Neighborhood Loop Multi-Day Window"
    assert third_local["label"] == "Post-Window Overflow Sweep"
    assert store_pickup["label"] == "Tomorrow Counter Pickup Wave"
    assert international_shipping["label"] == "Tomorrow Global Dispatch Window"

    assert store_pickup["start_date"].date() == today + timedelta(days=1)
    assert store_pickup["end_date"].date() == today + timedelta(days=1)
    assert international_shipping["start_date"].date() == today + timedelta(days=1)
    assert international_shipping["end_date"].date() == today + timedelta(days=1)

    assert result["created"] == [
        {"route_plan_id": 1},
        {"route_plan_id": 2},
        {"route_plan_id": 3},
        {"route_plan_id": 4},
        {"route_plan_id": 5},
    ]


def test_create_plan_bundle_local_delivery_creates_default_route_solution(monkeypatch):
    ctx = SimpleNamespace(identity={})
    route_calls = []

    plan = SimpleNamespace(id=100, client_id="delivery_plan_100", plan_type="local_delivery")
    local_plan = SimpleNamespace(id=200)
    event = SimpleNamespace(id=300)
    action = SimpleNamespace(id=400)

    monkeypatch.setattr(module.db.session, "flush", lambda: None)
    monkeypatch.setattr(module, "create_delivery_plan_row", lambda *_args, **_kwargs: plan)
    monkeypatch.setattr(
        module,
        "create_local_delivery_plan_row",
        lambda *_args, **_kwargs: local_plan,
    )

    def _fake_create_route_solution_row(*_args, **kwargs):
        route_calls.append(kwargs.get("route_index"))
        return SimpleNamespace(id=500 + len(route_calls))

    monkeypatch.setattr(module, "create_route_solution_row", _fake_create_route_solution_row)
    monkeypatch.setattr(module, "create_delivery_plan_event_row", lambda *_args, **_kwargs: event)
    monkeypatch.setattr(
        module,
        "create_delivery_plan_event_action_row",
        lambda *_args, **_kwargs: action,
    )

    result = module.create_plan_bundle(
        ctx,
        {
            "events": [
                {
                    "event_name": "test.event",
                    "actions": [{"action_name": "test.action"}],
                }
            ]
        },
        sequence=1,
    )

    assert route_calls == [1]
    assert result["route_plan_id"] == 100
    assert result["plan_type_id"] == 200
    assert result["route_solution_ids"] == [501]
    assert result["event_ids"] == [300]
    assert result["event_action_ids"] == [400]