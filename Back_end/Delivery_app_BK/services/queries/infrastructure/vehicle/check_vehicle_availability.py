from datetime import date
from typing import Optional, List, Dict, Any

from Delivery_app_BK.models import db
from Delivery_app_BK.models.tables.delivery_plan.delivery_plan_types.local_delivery_plan.route_solutions.route_solution import RouteSolution
from Delivery_app_BK.models.tables.delivery_plan.delivery_plan_types.local_delivery_plan.local_delivery_plan import LocalDeliveryPlan
from Delivery_app_BK.models.tables.delivery_plan.delivery_plan import DeliveryPlan


def check_vehicle_availability(
    vehicle_id: int,
    start_date: date,
    end_date: date,
    exclude_route_solution_id: Optional[int] = None,
) -> List[Dict[str, Any]]:
    """
    Returns conflicting selected route solutions for the given vehicle and date window.

    Conflict criteria:
    - route_solution.vehicle_id = vehicle_id
    - route_solution.is_selected = True
    - delivery_plan date window overlaps: existing.start_date <= query.end_date
                                      AND existing.end_date   >= query.start_date
    - route_solution.id != exclude_route_solution_id (if provided)
    """
    query = (
        db.session.query(
            RouteSolution.id.label("route_solution_id"),
            DeliveryPlan.id.label("delivery_plan_id"),
            DeliveryPlan.label.label("delivery_plan_label"),
            DeliveryPlan.start_date.label("start_date"),
            DeliveryPlan.end_date.label("end_date"),
        )
        .join(LocalDeliveryPlan, RouteSolution.local_delivery_plan_id == LocalDeliveryPlan.id)
        .join(DeliveryPlan, LocalDeliveryPlan.delivery_plan_id == DeliveryPlan.id)
        .filter(RouteSolution.vehicle_id == vehicle_id)
        .filter(RouteSolution.is_selected == True)  # noqa: E712
        # Standard date-overlap check:
        # existing window starts before or on query end_date
        .filter(DeliveryPlan.start_date <= end_date)
        # existing window ends on or after query start_date
        .filter(DeliveryPlan.end_date >= start_date)
    )

    if exclude_route_solution_id is not None:
        query = query.filter(RouteSolution.id != exclude_route_solution_id)

    rows = query.all()

    return [
        {
            "route_solution_id": row.route_solution_id,
            "delivery_plan_id": row.delivery_plan_id,
            "delivery_plan_label": row.delivery_plan_label,
            "start_date": row.start_date.strftime("%Y-%m-%d") if row.start_date else None,
            "end_date": row.end_date.strftime("%Y-%m-%d") if row.end_date else None,
        }
        for row in rows
    ]
