from types import SimpleNamespace

from Delivery_app_BK.services.commands.order.order_states import (
    update_orders_state as module,
)


class _DummyTransaction:
    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc, tb):
        return False


def test_update_orders_state_updates_and_emits(monkeypatch):
    state_instance = SimpleNamespace(id=4, name="Ready")
    order = SimpleNamespace(
        id=11,
        team_id=7,
        order_state_id=2,
        route_group=SimpleNamespace(id=9, route_solutions=[], orders=[], state_id=1),
        route_group_id=9,
        route_plan=None,
        delivery_plan=None,
    )
    emitted = []

    monkeypatch.setattr(module, "get_instance", lambda ctx, model, value: state_instance)
    monkeypatch.setattr(module, "_resolve_orders", lambda ctx, orders: [order])
    monkeypatch.setattr(module.db.session, "begin", lambda: _DummyTransaction())
    monkeypatch.setattr(
        module,
        "emit_order_events",
        lambda ctx, events: emitted.extend(events),
    )

    updated_orders = module.update_orders_state(
        ctx=SimpleNamespace(),
        orders=11,
        state_id=4,
    )

    assert order.order_state_id == 4
    assert len(updated_orders) == 1
    assert len(emitted) == 2


def test_update_orders_state_skips_unchanged_without_emitting(monkeypatch):
    state_instance = SimpleNamespace(id=4, name="Ready")
    order = SimpleNamespace(id=11, team_id=7, order_state_id=4)
    emitted = []

    monkeypatch.setattr(module, "get_instance", lambda ctx, model, value: state_instance)
    monkeypatch.setattr(module, "_resolve_orders", lambda ctx, orders: [order])
    monkeypatch.setattr(module.db.session, "begin", lambda: _DummyTransaction())
    monkeypatch.setattr(
        module,
        "emit_order_events",
        lambda ctx, events: emitted.extend(events),
    )

    updated_orders = module.update_orders_state(
        ctx=SimpleNamespace(),
        orders=11,
        state_id=4,
    )

    assert updated_orders == []
    assert emitted == []


def test_recompute_and_auto_complete_plans_runs_group_and_plan_sync(monkeypatch):
    route_group = SimpleNamespace(id=9, route_solutions=[])
    plan = SimpleNamespace(id=3)
    order = SimpleNamespace(
        id=11,
        delivery_plan=plan,
        route_group=route_group,
        route_group_id=9,
    )

    calls = {
        "recompute": 0,
        "auto": 0,
        "group_recompute": 0,
        "group_sync": 0,
        "plan_sync": 0,
    }

    monkeypatch.setattr(
        module,
        "recompute_plan_order_counts",
        lambda _plan: calls.__setitem__("recompute", calls["recompute"] + 1),
    )
    monkeypatch.setattr(
        module,
        "maybe_auto_complete_plan",
        lambda _plan: calls.__setitem__("auto", calls["auto"] + 1),
    )
    monkeypatch.setattr(
        module,
        "recompute_route_group_order_counts",
        lambda _solution: calls.__setitem__("group_recompute", calls["group_recompute"] + 1),
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

    module._recompute_and_auto_complete_plans([order])

    assert calls == {
        "recompute": 1,
        "auto": 1,
        "group_recompute": 0,
        "group_sync": 1,
        "plan_sync": 1,
    }


def test_recompute_and_auto_complete_plans_resolves_group_from_plan_when_missing_direct_ref(monkeypatch):
    route_group = SimpleNamespace(id=9, route_solutions=[])
    plan = SimpleNamespace(id=3, route_groups=[route_group])
    order = SimpleNamespace(
        id=11,
        delivery_plan=plan,
        route_group=None,
        route_group_id=9,
    )

    group_synced = []
    monkeypatch.setattr(module, "recompute_plan_order_counts", lambda _plan: None)
    monkeypatch.setattr(module, "maybe_auto_complete_plan", lambda _plan: None)
    monkeypatch.setattr(module, "recompute_route_group_order_counts", lambda _solution: None)
    monkeypatch.setattr(module, "maybe_sync_plan_state_from_groups", lambda _plan: None)
    monkeypatch.setattr(
        module,
        "maybe_sync_route_group_state",
        lambda group: group_synced.append(group.id),
    )

    module._recompute_and_auto_complete_plans([order])

    assert group_synced == [9]
