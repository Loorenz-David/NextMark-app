from __future__ import annotations

from datetime import datetime, timezone

from flask import current_app

from Delivery_app_BK.models import (
    AppEventOutbox,
    LocalDeliveryPlan,
    LocalDeliveryPlanEvent,
    OrderEvent,
    RouteSolutionEvent,
    RouteSolutionStopEvent,
    db,
)
from Delivery_app_BK.services.infra.jobs import with_app_context
from Delivery_app_BK.sockets.emitters.app_events import fanout_app_event
from Delivery_app_BK.sockets.emitters.local_delivery_plan_events import emit_local_delivery_plan_updated
from Delivery_app_BK.sockets.emitters.order_events import fanout_order_event
from Delivery_app_BK.sockets.emitters.route_solution_events import (
    emit_route_solution_created,
    emit_route_solution_deleted,
    emit_route_solution_updated,
)
from Delivery_app_BK.sockets.emitters.route_solution_stop_events import emit_route_solution_stop_updated


@with_app_context
def relay_order_event_job(event_row_id: int) -> None:
    event_row = db.session.get(OrderEvent, event_row_id)
    if event_row is None:
        current_app.logger.warning("OrderEvent not found: %d", event_row_id)
        return
    
    # Skip if already relayed (idempotency check)
    if event_row.relayed_at is not None:
        current_app.logger.debug("Event already relayed (idempotency): %d", event_row_id)
        return
    
    try:
        fanout_order_event(event_row)
        
        # Mark as relayed for idempotency
        event_row.relayed_at = datetime.now(timezone.utc)
        db.session.commit()
        current_app.logger.debug("Event relayed successfully: %d", event_row_id)
    except Exception as exc:
        current_app.logger.error(
            "Failed to relay OrderEvent %d: %s",
            event_row_id, str(exc), exc_info=True
        )
        raise


@with_app_context
def relay_local_delivery_plan_event_job(event_row_id: int) -> None:
    event_row = db.session.get(LocalDeliveryPlanEvent, event_row_id)
    if event_row is None:
        current_app.logger.warning("LocalDeliveryPlanEvent not found: %d", event_row_id)
        return
    
    # Skip if already relayed (idempotency check)
    if event_row.relayed_at is not None:
        current_app.logger.debug("Event already relayed (idempotency): %d", event_row_id)
        return
    
    try:
        local_delivery_plan = db.session.get(LocalDeliveryPlan, event_row.local_delivery_plan_id)
        if local_delivery_plan is None:
            current_app.logger.error(
                "LocalDeliveryPlan not found for event %d (plan_id: %d)",
                event_row_id, event_row.local_delivery_plan_id
            )
            return
        
        emit_local_delivery_plan_updated(local_delivery_plan, payload=event_row.payload)
        
        # Mark as relayed for idempotency
        event_row.relayed_at = datetime.now(timezone.utc)
        db.session.commit()
        current_app.logger.debug("Event relayed successfully: %d", event_row_id)
    except Exception as exc:
        current_app.logger.error(
            "Failed to relay LocalDeliveryPlanEvent %d: %s",
            event_row_id, str(exc), exc_info=True
        )
        raise


@with_app_context
def relay_route_solution_event_job(event_row_id: int) -> None:
    event_row = db.session.get(RouteSolutionEvent, event_row_id)
    if event_row is None:
        current_app.logger.warning("RouteSolutionEvent not found: %d", event_row_id)
        return
    
    # Skip if already relayed (idempotency check)
    if event_row.relayed_at is not None:
        current_app.logger.debug("Event already relayed (idempotency): %d", event_row_id)
        return
    
    try:
        from Delivery_app_BK.models import RouteSolution
        
        route_solution = db.session.get(RouteSolution, event_row.route_solution_id)
        if route_solution is None:
            current_app.logger.error(
                "RouteSolution not found for event %d (solution_id: %d)",
                event_row_id, event_row.route_solution_id
            )
            return
        
        if event_row.event_name == "route_solution.created":
            emit_route_solution_created(route_solution, payload=event_row.payload)
        elif event_row.event_name == "route_solution.updated":
            emit_route_solution_updated(route_solution, payload=event_row.payload)
        elif event_row.event_name == "route_solution.deleted":
            local_delivery_plan = db.session.get(LocalDeliveryPlan, route_solution.local_delivery_plan_id)
            if local_delivery_plan:
                emit_route_solution_deleted(
                    event_row.team_id,
                    local_delivery_plan.id,
                    event_row.route_solution_id,
                    payload=event_row.payload,
                )
        
        # Mark as relayed for idempotency
        event_row.relayed_at = datetime.now(timezone.utc)
        db.session.commit()
        current_app.logger.debug("Event relayed successfully: %d (%s)", event_row_id, event_row.event_name)
    except Exception as exc:
        current_app.logger.error(
            "Failed to relay RouteSolutionEvent %d (%s): %s",
            event_row_id, event_row.event_name, str(exc), exc_info=True
        )
        raise


@with_app_context
def relay_route_solution_stop_event_job(event_row_id: int) -> None:
    event_row = db.session.get(RouteSolutionStopEvent, event_row_id)
    if event_row is None:
        current_app.logger.warning("RouteSolutionStopEvent not found: %d", event_row_id)
        return
    
    # Skip if already relayed (idempotency check)
    if event_row.relayed_at is not None:
        current_app.logger.debug("Event already relayed (idempotency): %d", event_row_id)
        return
    
    try:
        from Delivery_app_BK.models import RouteSolutionStop
        
        route_solution_stop = db.session.get(RouteSolutionStop, event_row.route_solution_stop_id)
        if route_solution_stop is None:
            current_app.logger.error(
                "RouteSolutionStop not found for event %d (stop_id: %d)",
                event_row_id, event_row.route_solution_stop_id
            )
            return
        
        emit_route_solution_stop_updated(route_solution_stop, payload=event_row.payload)
        
        # Mark as relayed for idempotency
        event_row.relayed_at = datetime.now(timezone.utc)
        db.session.commit()
        current_app.logger.debug("Event relayed successfully: %d", event_row_id)
    except Exception as exc:
        current_app.logger.error(
            "Failed to relay RouteSolutionStopEvent %d: %s",
            event_row_id, str(exc), exc_info=True
        )
        raise


@with_app_context
def relay_app_event_job(event_row_id: int) -> None:
    event_row = db.session.get(AppEventOutbox, event_row_id)
    if event_row is None:
        current_app.logger.warning("AppEventOutbox not found: %d", event_row_id)
        return
    
    # Skip if already relayed (idempotency check)
    if event_row.relayed_at is not None:
        current_app.logger.debug("Event already relayed (idempotency): %d", event_row_id)
        return
    
    try:
        fanout_app_event(event_row)
        
        # Mark as relayed for idempotency
        event_row.relayed_at = datetime.now(timezone.utc)
        db.session.commit()
        current_app.logger.debug("Event relayed successfully: %d", event_row_id)
    except Exception as exc:
        current_app.logger.error(
            "Failed to relay AppEventOutbox %d: %s",
            event_row_id, str(exc), exc_info=True
        )
        raise
