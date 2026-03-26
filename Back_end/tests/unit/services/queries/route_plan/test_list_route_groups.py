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


def _fake_route_plan(route_group=None) -> MagicMock:
    plan = MagicMock()
    plan.id = 42
    plan.route_group = route_group
    return plan


def _fake_route_group(route_plan_id: int = 42) -> MagicMock:
    rg = MagicMock()
    rg.id = 10
    rg.client_id = "rg_10"
    rg.actual_start_time = None
    rg.actual_end_time = None
    rg.updated_at = None
    rg.driver_id = None
    rg.route_plan_id = route_plan_id
    return rg


# ---------------------------------------------------------------------------
# Success: plan has no route group attached
# ---------------------------------------------------------------------------

def test_list_route_groups_returns_empty_list_when_no_route_group():
    ctx = make_ctx()
    plan = _fake_route_plan(route_group=None)

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
    plan = _fake_route_plan(route_group=rg)
    serialized = [{"id": 10, "route_plan_id": 42}]

    with patch(f"{MODULE}.get_instance", return_value=plan), \
         patch(f"{MODULE}.serialize_local_delivery_plans", return_value=serialized):
        result = list_route_groups(42, ctx)

    assert result["route_plan_id"] == 42
    assert len(result["route_groups"]) == 1
    assert result["route_groups"][0]["id"] == 10


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
