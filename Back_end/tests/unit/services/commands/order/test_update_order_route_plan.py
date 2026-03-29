import pytest
from types import SimpleNamespace

from Delivery_app_BK.errors import ValidationFailed
from Delivery_app_BK.services.commands.order import update_order_route_plan as module


def test_normalize_order_ids_accepts_single_int():
    assert module._normalize_order_ids(5) == [5]


def test_normalize_order_ids_dedupes_list():
    assert module._normalize_order_ids([1, 1, 2]) == [1, 2]


def test_normalize_order_ids_rejects_string_ids():
    with pytest.raises(ValidationFailed):
        module._normalize_order_ids(["client-1"])  # type: ignore[list-item]


def test_apply_move_state_heritage_recomputes_group_counts(monkeypatch):
    order = SimpleNamespace(id=1, order_state_id=2)
    route_group = SimpleNamespace(id=20)
    new_plan = SimpleNamespace(id=15)

    calls = {
        "plan_recompute": 0,
        "group_recompute": 0,
        "plan_auto": 0,
        "group_sync": 0,
        "plan_sync": 0,
    }

    monkeypatch.setattr(
        module,
        "compute_destination_move_result",
        lambda *_args, **_kwargs: SimpleNamespace(
            new_order_state_id=None,
            new_plan_state_id=None,
            should_create_case=False,
            case_predefined_text=None,
        ),
    )
    monkeypatch.setattr(
        module,
        "recompute_plan_order_counts",
        lambda _plan: calls.__setitem__("plan_recompute", calls["plan_recompute"] + 1),
    )
    monkeypatch.setattr(
        module,
        "recompute_route_group_order_counts",
        lambda _group: calls.__setitem__("group_recompute", calls["group_recompute"] + 1),
    )
    monkeypatch.setattr(
        module,
        "maybe_auto_complete_plan",
        lambda _plan: calls.__setitem__("plan_auto", calls["plan_auto"] + 1),
    )
    monkeypatch.setattr(
        module,
        "maybe_sync_route_group_state",
        lambda _group: calls.__setitem__("group_sync", calls["group_sync"] + 1),
    )
    monkeypatch.setattr(
        module,
        "maybe_sync_plan_state_from_groups",
        lambda _plan: calls.__setitem__("plan_sync", calls["plan_sync"] + 1),
    )

    module._apply_move_state_heritage(
        ctx=SimpleNamespace(identity=None, incoming_data={}),
        changed_orders=[order],
        new_plan=new_plan,
        plans_to_recompute={new_plan.id: new_plan},
        affected_route_groups=[route_group],
        case_message=None,
    )

    assert calls == {
        "plan_recompute": 1,
        "group_recompute": 1,
        "plan_auto": 1,
        "group_sync": 1,
        "plan_sync": 1,
    }
