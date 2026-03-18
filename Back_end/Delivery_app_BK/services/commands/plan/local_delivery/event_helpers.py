"""Event creation helpers for local delivery plan, route solution, and route stop changes."""

from datetime import datetime, timezone

from Delivery_app_BK.models import db
from Delivery_app_BK.models.tables.delivery_plan.local_delivery_plan_event import LocalDeliveryPlanEvent
from Delivery_app_BK.models.tables.delivery_plan.delivery_plan_types.local_delivery_plan.route_solutions.route_solution_event import RouteSolutionEvent
from Delivery_app_BK.models.tables.delivery_plan.delivery_plan_types.local_delivery_plan.route_solutions.route_solution_stop_event import RouteSolutionStopEvent
from Delivery_app_BK.services.context import ServiceContext


def create_local_delivery_plan_event(
    ctx: ServiceContext,
    team_id: int,
    local_delivery_plan_id: int,
    event_name: str,
    payload: dict | None = None,
) -> LocalDeliveryPlanEvent | None:
    """
    Create and persist a LocalDeliveryPlanEvent record.
    
    Args:
        ctx: ServiceContext with user_id for actor_id
        team_id: Team ID
        local_delivery_plan_id: LocalDeliveryPlan ID
        event_name: Event name (e.g., "local_delivery_plan.updated")
        payload: Event payload (dict)
    
    Returns:
        LocalDeliveryPlanEvent instance if created, None if prevented
    """
    if ctx.prevent_event_bus:
        return None
    
    event = LocalDeliveryPlanEvent(
        team_id=team_id,
        local_delivery_plan_id=local_delivery_plan_id,
        event_name=event_name,
        actor_id=ctx.user_id,
        payload=payload or {},
        occurred_at=datetime.now(timezone.utc),
        dispatch_status=0,  # Pending
    )
    db.session.add(event)
    db.session.commit()
    return event


def create_route_solution_event(
    ctx: ServiceContext,
    team_id: int,
    route_solution_id: int,
    event_name: str,
    payload: dict | None = None,
) -> RouteSolutionEvent | None:
    """
    Create and persist a RouteSolutionEvent record.
    
    Args:
        ctx: ServiceContext with user_id for actor_id
        team_id: Team ID
        route_solution_id: RouteSolution ID
        event_name: Event name (e.g., "route_solution.created", "route_solution.updated")
        payload: Event payload (dict)
    
    Returns:
        RouteSolutionEvent instance if created, None if prevented
    """
    if ctx.prevent_event_bus:
        return None
    
    event = RouteSolutionEvent(
        team_id=team_id,
        route_solution_id=route_solution_id,
        event_name=event_name,
        actor_id=ctx.user_id,
        payload=payload or {},
        occurred_at=datetime.now(timezone.utc),
        dispatch_status=0,  # Pending
    )
    db.session.add(event)
    db.session.commit()
    return event


def create_route_solution_stop_event(
    ctx: ServiceContext,
    team_id: int,
    route_solution_stop_id: int,
    event_name: str,
    payload: dict | None = None,
) -> RouteSolutionStopEvent | None:
    """
    Create and persist a RouteSolutionStopEvent record.
    
    Args:
        ctx: ServiceContext with user_id for actor_id
        team_id: Team ID
        route_solution_stop_id: RouteSolutionStop ID
        event_name: Event name (e.g., "route_solution_stop.updated")
        payload: Event payload (dict)
    
    Returns:
        RouteSolutionStopEvent instance if created, None if prevented
    """
    if ctx.prevent_event_bus:
        return None
    
    event = RouteSolutionStopEvent(
        team_id=team_id,
        route_solution_stop_id=route_solution_stop_id,
        event_name=event_name,
        actor_id=ctx.user_id,
        payload=payload or {},
        occurred_at=datetime.now(timezone.utc),
        dispatch_status=0,  # Pending
    )
    db.session.add(event)
    db.session.commit()
    return event
