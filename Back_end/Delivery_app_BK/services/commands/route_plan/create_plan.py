from datetime import datetime, timezone
from uuid import uuid4

from Delivery_app_BK.models import db, RoutePlan, RouteGroup, RouteSolution, RoutePlanState, Team, Order
from Delivery_app_BK.route_optimization.constants.is_optimized import (
    IS_OPTIMIZED_NOT_OPTIMIZED,
)
from Delivery_app_BK.route_optimization.constants.route_end_strategy import (
    CUSTOM_END_ADDRESS,
    LAST_STOP,
    ROUND_TRIP,
)
from Delivery_app_BK.services.commands.utils import generate_client_id
from Delivery_app_BK.services.domain.route_operations.plan.plan_states import PlanStateId
from Delivery_app_BK.services.domain.route_operations.local_delivery import (
    combine_plan_date_and_local_hhmm_to_utc,
    normalize_service_time_payload,
    resolve_request_timezone,
)
from Delivery_app_BK.services.infra.events.emiters.order import emit_order_events
from Delivery_app_BK.sockets.emitters.route_solution_events import emit_route_solution_created
from Delivery_app_BK.sockets.notifications import notify_delivery_planning_event
from Delivery_app_BK.services.commands.order.update_order_route_plan import (
    apply_orders_route_plan_change,
)
from Delivery_app_BK.services.requests.route_plan.plan.create_plan import (
    parse_create_plan_request,
)
from ...context import ServiceContext
from ..base.create_instance import create_instance
from ..utils import extract_fields
from .create_serializers import (
    serialize_created_route_plan,
    serialize_created_route_group,
    serialize_created_route_solution,
)


def create_plan(ctx: ServiceContext):
    ctx.set_relationship_map(
        {
            "team_id": Team,
            "state_id": RoutePlanState,
            "orders": Order
        }
    )
    pending_order_events: list[dict] = []
    created_bundles: list[dict] = []
    created_route_solutions: list = []

    create_items = [
        parse_create_plan_request(field_set) for field_set in extract_fields(ctx)
    ]

    def _apply() -> None:
        creation_context: list[dict] = []

        for item in create_items:
            route_plan_fields = {
                "client_id": item.client_id,
                "label": item.label,
                "date_strategy": item.date_strategy,
                "start_date": item.start_date,
                "end_date": item.end_date,
                "state_id": PlanStateId.OPEN,
            }
            route_plan_instance: RoutePlan = create_instance(
                ctx,
                RoutePlan,
                route_plan_fields,
            )
            route_group_instance, extra_instances = _build_route_group_instances(
                ctx=ctx,
                route_plan_instance=route_plan_instance,
                route_group_defaults=item.route_group_defaults,
            )
            creation_context.append(
                {
                    "route_plan": route_plan_instance,
                    "route_group": route_group_instance,
                    "extra_instances": extra_instances,
                    "order_ids": item.order_ids,
                }
            )

        db.session.add_all([entry["route_plan"] for entry in creation_context])
        db.session.add_all([entry["route_group"] for entry in creation_context])
        extra_instances = [instance 
                           for entry in creation_context 
                           for instance in entry["extra_instances"]
        ]
        if extra_instances:
            db.session.add_all(extra_instances)
        db.session.flush()

        for entry in creation_context:
            linked_order_ids = entry["order_ids"]
            if linked_order_ids:
                outcome = apply_orders_route_plan_change(
                    ctx,
                    linked_order_ids,
                    entry["route_plan"].id,
                )
                pending_order_events.extend(outcome["pending_events"])

        for entry in creation_context:
            route_plan_instance: RoutePlan = entry["route_plan"]
            route_group_instance = entry["route_group"]
            bundle = {
                "delivery_plan": serialize_created_route_plan(route_plan_instance),
                "route_group": serialize_created_route_group(route_group_instance),
            }
            local_route_solution = _find_created_route_solution(entry["extra_instances"])
            if local_route_solution:
                bundle["route_solution"] = serialize_created_route_solution(
                    local_route_solution
                )
                created_route_solutions.append(local_route_solution)
            created_bundles.append(bundle)

    with db.session.begin():
        _apply()

    if pending_order_events:
        emit_order_events(ctx, pending_order_events)

    for route_solution in created_route_solutions:
        emit_route_solution_created(route_solution)

    for bundle in created_bundles:
        route_plan_payload = bundle.get("delivery_plan") or {}
        route_plan_id = route_plan_payload.get("id")
        if not isinstance(route_plan_id, int):
            continue
        notify_delivery_planning_event(
            event_id=str(uuid4()),
            event_name="route_plan.created",
            team_id=ctx.team_id,
            entity_type="route_plan",
            entity_id=route_plan_id,
            payload={
                "route_plan_id": route_plan_id,
                "label": route_plan_payload.get("label"),
                "date_strategy": route_plan_payload.get("date_strategy"),
                "route_freshness_updated_at": route_plan_payload.get("updated_at"),
            },
            occurred_at=datetime.now(timezone.utc),
            actor=None,
        )

    return {"created": created_bundles}


def _find_created_route_solution(extra_instances: list[object]) -> RouteSolution | None:
    for instance in extra_instances:
        if isinstance(instance, RouteSolution):
            return instance
    return None


def _build_route_group_instances(
    ctx: ServiceContext,
    route_plan_instance: RoutePlan,
    route_group_defaults: dict,
) -> tuple[RouteGroup, list[object]]:
    defaults = route_group_defaults if isinstance(route_group_defaults, dict) else {}
    route_group = create_instance(
        ctx,
        RouteGroup,
        {
            "client_id": defaults.get("client_id") or generate_client_id("route_group"),
            "route_plan_id": route_plan_instance.id,
        },
    )

    route_solution_defaults = defaults.get("route_solution")
    if not isinstance(route_solution_defaults, dict):
        route_solution_defaults = {}

    raw_strategy = route_solution_defaults.get("route_end_strategy")
    allowed_strategies = {ROUND_TRIP, CUSTOM_END_ADDRESS, LAST_STOP}
    route_end_strategy = (
        raw_strategy if isinstance(raw_strategy, str) and raw_strategy in allowed_strategies else ROUND_TRIP
    )

    start_location = route_solution_defaults.get("start_location")
    if not isinstance(start_location, dict):
        start_location = None

    end_location = route_solution_defaults.get("end_location")
    if not isinstance(end_location, dict):
        end_location = None

    set_start_time = route_solution_defaults.get("set_start_time")
    if not isinstance(set_start_time, str):
        set_start_time = None

    set_end_time = route_solution_defaults.get("set_end_time")
    if not isinstance(set_end_time, str):
        set_end_time = None

    request_timezone = resolve_request_timezone(ctx, route_plan_instance)
    expected_start_time = combine_plan_date_and_local_hhmm_to_utc(
        plan_date=route_plan_instance.start_date,
        hhmm=set_start_time,
        tz=request_timezone,
    )

    driver_id = route_solution_defaults.get("driver_id")
    if not isinstance(driver_id, int) or isinstance(driver_id, bool):
        driver_id = None

    eta_tolerance_seconds = route_solution_defaults.get("eta_tolerance_seconds")
    if not isinstance(eta_tolerance_seconds, int) or isinstance(eta_tolerance_seconds, bool):
        eta_tolerance_seconds = 0

    route_solution = RouteSolution(
        client_id=generate_client_id("route_solution"),
        label="variant 1",
        is_selected=True,
        is_optimized=IS_OPTIMIZED_NOT_OPTIMIZED,
        stop_count=0,
        team_id=ctx.team_id,
        start_location=start_location,
        end_location=end_location,
        set_start_time=set_start_time,
        expected_start_time=expected_start_time,
        set_end_time=set_end_time,
        eta_tolerance_seconds=max(0, min(7200, eta_tolerance_seconds)),
        stops_service_time=normalize_service_time_payload(
            route_solution_defaults.get("stops_service_time")
        ),
        route_end_strategy=route_end_strategy,
        driver_id=driver_id,
    )
    route_group.route_solutions.append(route_solution)
    return route_group, [route_solution]
