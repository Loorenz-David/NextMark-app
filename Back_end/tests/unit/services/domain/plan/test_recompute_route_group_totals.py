from types import SimpleNamespace

from Delivery_app_BK.services.domain.route_operations.plan import recompute_route_group_totals as module


class _RouteGroupQuery:
    def __init__(self, route_groups):
        self._route_groups = route_groups

    def filter(self, *args, **kwargs):
        return self

    def all(self):
        return list(self._route_groups)


class _AggregateQuery:
    def __init__(self, rows):
        self._rows = rows

    def join(self, *args, **kwargs):
        return self

    def filter(self, *args, **kwargs):
        return self

    def group_by(self, *args, **kwargs):
        return self

    def all(self):
        return list(self._rows)


def test_recompute_route_group_totals_updates_counts_and_is_idempotent(monkeypatch):
    route_group_zone_3 = SimpleNamespace(zone_id=3, total_orders=None)
    route_group_zone_7 = SimpleNamespace(zone_id=7, total_orders=None)

    def _query(*args, **kwargs):
        if len(args) == 1 and args[0] is module.RouteGroup:
            return _RouteGroupQuery([route_group_zone_3, route_group_zone_7])
        return _AggregateQuery([(3, 5)])

    monkeypatch.setattr(module.db.session, "query", _query)

    plan = SimpleNamespace(id=42, team_id=1)
    module.recompute_route_group_totals(plan)
    module.recompute_route_group_totals(plan)

    assert route_group_zone_3.total_orders == 5
    assert route_group_zone_7.total_orders == 0


def test_recompute_route_group_totals_skips_when_no_zone_backed_groups(monkeypatch):
    def _query(*args, **kwargs):
        if len(args) == 1 and args[0] is module.RouteGroup:
            return _RouteGroupQuery([])
        raise AssertionError("Aggregate query should not run when no route groups exist")

    monkeypatch.setattr(module.db.session, "query", _query)

    module.recompute_route_group_totals(SimpleNamespace(id=42, team_id=1))
