from __future__ import annotations

from datetime import datetime, timezone

from Delivery_app_BK.models import DeliveryPlan, Order, RouteSolution, RouteSolutionStop, db


def touch_route_freshness(delivery_plan: DeliveryPlan | None) -> datetime | None:
    if delivery_plan is None or delivery_plan.plan_type != "local_delivery":
        return None

    now = datetime.now(timezone.utc)
    delivery_plan.updated_at = now
    return now


def touch_route_freshness_by_route(route_solution: RouteSolution | None) -> datetime | None:
    if route_solution is None or route_solution.local_delivery_plan is None:
        return None

    return touch_route_freshness(route_solution.local_delivery_plan.delivery_plan)


def touch_route_freshness_by_stop(route_stop: RouteSolutionStop | None) -> datetime | None:
    if route_stop is None or route_stop.route_solution_id is None:
        return None

    route_solution = db.session.get(RouteSolution, route_stop.route_solution_id)
    return touch_route_freshness_by_route(route_solution)


def touch_route_freshness_by_order(order: Order | None) -> datetime | None:
    if order is None or order.delivery_plan_id is None:
        return None

    delivery_plan = getattr(order, "delivery_plan", None) or db.session.get(DeliveryPlan, order.delivery_plan_id)
    if delivery_plan is None or delivery_plan.plan_type != "local_delivery":
        return None

    return touch_route_freshness(delivery_plan)


def get_route_freshness_updated_at(delivery_plan: DeliveryPlan | None) -> str | None:
    if delivery_plan is None or delivery_plan.updated_at is None:
        return None

    return delivery_plan.updated_at.isoformat()
