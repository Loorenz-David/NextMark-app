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

    def scalar(self):
        return self._rows[0] if self._rows else 0


def _make_query(route_groups, zone_agg_rows=None, no_zone_count=0):
    """Return a query factory that dispatches on query subject."""
    def _query(*args):
        col_or_model = args[0]
        if col_or_model is module.RouteGroup:
            return _RouteGroupQuery(route_groups)
        # scalar count query for No-Zone (func.count(Order.id))
        return _AggregateQuery(zone_agg_rows if zone_agg_rows is not None else [])

    return _query


# ---------------------------------------------------------------------------
# Zone-backed groups
# ---------------------------------------------------------------------------

def test_recompute_route_group_totals_updates_zone_counts(monkeypatch):
    rg_zone_3 = SimpleNamespace(zone_id=3, total_orders=None)
    rg_zone_7 = SimpleNamespace(zone_id=7, total_orders=None)

    def _query(*args):
        col_or_model = args[0]
        if col_or_model is module.RouteGroup:
            return _RouteGroupQuery([rg_zone_3, rg_zone_7])
        return _AggregateQuery([(3, 5)])

    monkeypatch.setattr(module.db.session, "query", _query)

    plan = SimpleNamespace(id=42, team_id=1)
    module.recompute_route_group_totals(plan)

    assert rg_zone_3.total_orders == 5
    assert rg_zone_7.total_orders == 0


def test_recompute_route_group_totals_is_idempotent(monkeypatch):
    rg = SimpleNamespace(zone_id=3, total_orders=None)

    def _query(*args):
        col_or_model = args[0]
        if col_or_model is module.RouteGroup:
            return _RouteGroupQuery([rg])
        return _AggregateQuery([(3, 9)])

    monkeypatch.setattr(module.db.session, "query", _query)

    plan = SimpleNamespace(id=42, team_id=1)
    module.recompute_route_group_totals(plan)
    module.recompute_route_group_totals(plan)

    assert rg.total_orders == 9


def test_recompute_route_group_totals_skips_when_no_groups(monkeypatch):
    called = []

    def _query(*args):
        if args[0] is module.RouteGroup:
            return _RouteGroupQuery([])
        called.append(args)
        raise AssertionError("Aggregate query should not run when no groups exist")

    monkeypatch.setattr(module.db.session, "query", _query)
    module.recompute_route_group_totals(SimpleNamespace(id=42, team_id=1))

    assert called == []


# ---------------------------------------------------------------------------
# No-Zone bucket
# ---------------------------------------------------------------------------

def test_recompute_sets_no_zone_total_via_direct_order_count(monkeypatch):
    """No-Zone group total must be counted via Order.route_group_id, not zone join."""
    rg_no_zone = SimpleNamespace(zone_id=None, id=88, total_orders=None)
    scalar_calls = []

    class _ScalarQuery:
        def filter(self, *_):
            return self
        def scalar(self):
            scalar_calls.append(True)
            return 4

    def _query(*args):
        col_or_model = args[0]
        if col_or_model is module.RouteGroup:
            return _RouteGroupQuery([rg_no_zone])
        # func.count(Order.id) path
        return _ScalarQuery()

    monkeypatch.setattr(module.db.session, "query", _query)

    module.recompute_route_group_totals(SimpleNamespace(id=42, team_id=1))

    assert rg_no_zone.total_orders == 4
    assert scalar_calls, "scalar() must be called for No-Zone group"


def test_recompute_mixed_zone_and_no_zone_groups(monkeypatch):
    """Plan with both zone groups and a No-Zone bucket updates both correctly."""
    rg_zone = SimpleNamespace(zone_id=3, total_orders=None)
    rg_no_zone = SimpleNamespace(zone_id=None, id=99, total_orders=None)

    class _ScalarQuery:
        def filter(self, *_):
            return self
        def scalar(self):
            return 7

    def _query(*args):
        col_or_model = args[0]
        if col_or_model is module.RouteGroup:
            return _RouteGroupQuery([rg_zone, rg_no_zone])
        # Zone aggregation passes two column expressions; scalar count passes one.
        if len(args) > 1:
            return _AggregateQuery([(3, 5)])
        return _ScalarQuery()

    monkeypatch.setattr(module.db.session, "query", _query)

    module.recompute_route_group_totals(SimpleNamespace(id=42, team_id=1))

    assert rg_zone.total_orders == 5
    assert rg_no_zone.total_orders == 7

