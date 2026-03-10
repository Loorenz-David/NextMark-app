from __future__ import annotations

from typing import Any

from Delivery_app_BK.models import RouteSolution, db
from Delivery_app_BK.services.context import ServiceContext
from Delivery_app_BK.services.domain.local_delivery import resolve_actual_timestamp
from Delivery_app_BK.services.queries.get_instance import get_instance
from Delivery_app_BK.services.queries.route_solutions import serialize_route_solutions
from Delivery_app_BK.services.requests.plan.local_delivery import (
    ActualTimeMarkRequest,
    parse_mark_actual_time_request,
)


def mark_route_solution_actual_end_time(
    ctx: ServiceContext,
    route_solution_id: int,
    request: ActualTimeMarkRequest | dict[str, Any] | None,
):
    parsed = (
        request
        if isinstance(request, ActualTimeMarkRequest)
        else parse_mark_actual_time_request(request)
    )

    route_solution: RouteSolution = get_instance(
        ctx=ctx,
        model=RouteSolution,
        value=route_solution_id,
    )
    route_solution.actual_end_time = resolve_actual_timestamp(parsed.time)
    db.session.add(route_solution)
    db.session.commit()

    return {
        "route_solution": serialize_route_solutions([route_solution], ctx),
    }
