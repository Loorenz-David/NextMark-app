from sqlalchemy.orm import selectinload

from Delivery_app_BK.errors import NotFound, PermissionDenied, ValidationFailed
from Delivery_app_BK.models import LocalDeliveryPlan, RouteSolution, db
from Delivery_app_BK.services.context import ServiceContext
from Delivery_app_BK.services.domain.plan.route_freshness import get_route_freshness_updated_at
from Delivery_app_BK.services.utils import require_team_id


def get_active_route_freshness(route_id: int, ctx: ServiceContext):
    if route_id is None or route_id <= 0:
        raise ValidationFailed("route_id is required.")

    team_id = require_team_id(ctx)
    route = (
        db.session.query(RouteSolution)
        .options(
            selectinload(RouteSolution.local_delivery_plan).selectinload(
                LocalDeliveryPlan.delivery_plan
            ),
        )
        .filter(
            RouteSolution.team_id == team_id,
            RouteSolution.id == route_id,
            RouteSolution.is_selected.is_(True),
        )
        .one_or_none()
    )

    if route is None:
        raise NotFound(f"Active route with id: {route_id} does not exist.")

    if ctx.app_scope == "driver" and route.driver_id != ctx.user_id:
        raise PermissionDenied("You are not authorized to access this route.")

    delivery_plan = (
        route.local_delivery_plan.delivery_plan
        if route.local_delivery_plan is not None
        else None
    )

    return {
        "route_id": route.id,
        "delivery_plan_id": delivery_plan.id if delivery_plan is not None else None,
        "route_freshness_updated_at": get_route_freshness_updated_at(delivery_plan),
    }
