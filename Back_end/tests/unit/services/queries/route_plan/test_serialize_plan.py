from types import SimpleNamespace

from Delivery_app_BK.services.context import ServiceContext
from Delivery_app_BK.services.queries.route_plan.serialize_plan import serialize_plans


def _plan(route_groups):
    return SimpleNamespace(
        id=11,
        client_id="delivery_plan:11",
        label="Plan A",
        date_strategy="single",
        start_date=None,
        end_date=None,
        created_at=None,
        updated_at=None,
        state_id=1,
        total_orders=0,
        total_weight_g=0.0,
        total_volume_cm3=0.0,
        total_item_count=0,
        orders=[],
        route_groups=route_groups,
    )


def test_serialize_plans_includes_route_groups_count_for_list_shape():
    route_groups = [SimpleNamespace(id=2, name="Zone B"), SimpleNamespace(id=1, name="Zone A")]
    serialized = serialize_plans(
        [_plan(route_groups)],
        ServiceContext(incoming_data={}, identity={}, on_query_return="list"),
    )

    assert serialized[0]["route_groups_count"] == 2
    assert "route_groups" not in serialized[0]


def test_serialize_plans_includes_detail_route_groups_summary_when_requested():
    route_groups = [
        SimpleNamespace(
            id=9,
            name="Zone South",
            zone_id=7,
            total_orders=5,
            state=SimpleNamespace(id=2, name="OPEN"),
        ),
        SimpleNamespace(
            id=4,
            name="Zone North",
            zone_id=3,
            total_orders=1,
            state=None,
        ),
    ]

    serialized = serialize_plans(
        [_plan(route_groups)],
        ServiceContext(incoming_data={}, identity={}, on_query_return="list"),
        include_route_groups_summary=True,
    )

    assert serialized[0]["route_groups_count"] == 2
    assert [group["name"] for group in serialized[0]["route_groups"]] == [
        "Zone North",
        "Zone South",
    ]
    assert serialized[0]["route_groups"][0]["state"] is None
    assert serialized[0]["route_groups"][1]["state"] == {"id": 2, "name": "OPEN"}
