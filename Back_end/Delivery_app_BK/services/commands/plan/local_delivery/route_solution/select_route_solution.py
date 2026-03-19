from Delivery_app_BK.errors import ValidationFailed
from Delivery_app_BK.models import RouteSolution, db

from Delivery_app_BK.services.context import ServiceContext
from Delivery_app_BK.services.queries.get_instance import get_instance
from Delivery_app_BK.services.commands.utils import build_create_result
from Delivery_app_BK.services.commands.plan.local_delivery.event_helpers import create_route_solution_event
from Delivery_app_BK.services.domain.local_delivery.route_lifecycle import (
    ensure_single_selected_route_solution,
)
from Delivery_app_BK.sockets.contracts.realtime import BUSINESS_EVENT_ROUTE_SOLUTION_UPDATED
from Delivery_app_BK.sockets.emitters.route_solution_events import emit_route_solution_updated


def select_route_solution(ctx: ServiceContext, route_solution_id: int):
    route_solution = get_instance(
        ctx=ctx,
        model=RouteSolution,
        value=route_solution_id,
    )
    if not route_solution.local_delivery_plan_id:
        raise ValidationFailed("Route solution has no local delivery plan.")

    updated = ensure_single_selected_route_solution(
        route_solution.local_delivery_plan_id,
        preferred_route_solution_id=route_solution.id,
    )
    db.session.add_all(updated or [route_solution])
    db.session.commit()

    # Emit real-time events
    team_id = route_solution.team_id

    for updated_route in updated or [route_solution]:
        create_route_solution_event(
            ctx=ctx,
            team_id=team_id,
            route_solution_id=updated_route.id,
            event_name=BUSINESS_EVENT_ROUTE_SOLUTION_UPDATED,
            payload={"is_selected": bool(updated_route.is_selected)},
        )
        emit_route_solution_updated(
            updated_route,
            payload={"is_selected": bool(updated_route.is_selected)},
        )

    return {
        "route_solution": build_create_result(
            ctx,
            updated or [route_solution],
            extract_fields=["id", "is_selected"],
        ),
    }
