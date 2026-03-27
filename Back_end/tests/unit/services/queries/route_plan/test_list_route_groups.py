import pytest
from unittest.mock import MagicMock, patch
from sqlalchemy.orm.exc import NoResultFound

from Delivery_app_BK.errors import NotFound
from Delivery_app_BK.services.context import ServiceContext
from Delivery_app_BK.services.queries.route_plan.route_groups.list_route_groups import (
    list_route_groups,
)

MODULE = "Delivery_app_BK.services.queries.route_plan.route_groups.list_route_groups"


def make_ctx(team_id: int = 1) -> ServiceContext:
    return ServiceContext(identity={"active_team_id": team_id})


def _fake_route_plan(route_groups=None) -> MagicMock:
    plan = MagicMock()
    plan.id = 42
    plan.route_groups = route_groups or []
    return plan


def _fake_route_group(route_plan_id: int = 42) -> MagicMock:
    rg = MagicMock()
    rg.id = 10
    rg.client_id = "rg_10"
    rg.name = "Zone North"
    rg.zone_id = 7
    rg.zone_geometry_snapshot = {"type": "Polygon", "coordinates": []}
    rg.template_snapshot = {"max_stops": 20}
    rg.actual_start_time = None
    rg.actual_end_time = None
    rg.updated_at = None
    rg.driver_id = None
    rg.route_plan_id = route_plan_id
    rg.total_orders = 3
    rg.driver = None
    rg.state = None
    rg.zone = None
    rg.route_solutions = []
    return rg


# ---------------------------------------------------------------------------
# Success: plan has no route group attached
# ---------------------------------------------------------------------------

def test_list_route_groups_returns_empty_list_when_no_route_group():
    ctx = make_ctx()
    plan = _fake_route_plan(route_groups=[])

    with patch(f"{MODULE}.get_instance", return_value=plan):
        result = list_route_groups(42, ctx)

    assert result["route_plan_id"] == 42
    assert result["route_groups"] == []


# ---------------------------------------------------------------------------
# Success: plan has one route group attached
# ---------------------------------------------------------------------------

def test_list_route_groups_returns_serialized_route_group():
    ctx = make_ctx()
    rg = _fake_route_group(route_plan_id=42)
    plan = _fake_route_plan(route_groups=[rg])

    with patch(f"{MODULE}.get_instance", return_value=plan):
        result = list_route_groups(42, ctx)

    assert result["route_plan_id"] == 42
    assert len(result["route_groups"]) == 1
    assert result["route_groups"][0]["id"] == 10
    assert result["route_groups"][0]["zone_id"] == 7


def test_list_route_groups_returns_deterministic_name_ordering():
    ctx = make_ctx()

    rg_b = _fake_route_group(route_plan_id=42)
    rg_b.id = 11
    rg_b.name = "Zone South"

    rg_a = _fake_route_group(route_plan_id=42)
    rg_a.id = 12
    rg_a.name = "Zone North"

    # Intentionally pass unsorted order from relationship to ensure query serializer sorts.
    plan = _fake_route_plan(route_groups=[rg_b, rg_a])

    with patch(f"{MODULE}.get_instance", return_value=plan):
        result = list_route_groups(42, ctx)

    assert [group["name"] for group in result["route_groups"]] == ["Zone North", "Zone South"]


# ---------------------------------------------------------------------------
# Plan not found: get_instance raises NoResultFound
# ---------------------------------------------------------------------------

def test_list_route_groups_raises_not_found_when_plan_missing():
    ctx = make_ctx()

    with patch(f"{MODULE}.get_instance", side_effect=NoResultFound):
        with pytest.raises(NotFound):
            list_route_groups(999, ctx)


# ---------------------------------------------------------------------------
# Team-scope violation: get_instance raises (any exception from ensure_instance_in_team)
# ---------------------------------------------------------------------------

def test_list_route_groups_propagates_team_scope_error():
    ctx = make_ctx(team_id=99)

    with patch(f"{MODULE}.get_instance", side_effect=Exception("team scope violation")):
        with pytest.raises(Exception, match="team scope"):
            list_route_groups(42, ctx)
