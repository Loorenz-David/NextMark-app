from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime, timedelta, timezone

from sqlalchemy.orm import Query

from Delivery_app_BK.models import AppEventOutbox, DeliveryPlanEvent, OrderEvent, db
from Delivery_app_BK.services.infra.jobs import DEFAULT_RETRY_POLICY, enqueue_job
from Delivery_app_BK.services.infra.jobs.tasks.events import (
    process_app_event_outbox_job,
    process_delivery_plan_event_job,
    process_order_event_job,
)

MAX_DISPATCH_ATTEMPTS = 5


@dataclass(frozen=True)
class DispatchTarget:
    model: type
    job_fn: object
    label: str


DISPATCH_TARGETS = (
    DispatchTarget(OrderEvent, process_order_event_job, "order"),
    DispatchTarget(DeliveryPlanEvent, process_delivery_plan_event_job, "delivery_plan"),
    DispatchTarget(AppEventOutbox, process_app_event_outbox_job, "app"),
)


def dispatch_pending_events(*, dispatcher_id: str, batch_size: int, lease_seconds: int) -> int:
    recovered = repair_stale_claims(lease_seconds=lease_seconds)
    claimed_count = 0
    if recovered:
        db.session.commit()
   
    for target in DISPATCH_TARGETS:
        
        claimed_rows = _claim_rows(target, dispatcher_id=dispatcher_id, batch_size=batch_size)
        claimed_count += len(claimed_rows)
        
        for row in claimed_rows:
           
            try:
                enqueue_job(
                    queue_key="events",
                    fn=target.job_fn,
                    args=(row.id,),
                    retry_policy=DEFAULT_RETRY_POLICY,
                    description=f"dispatch:{target.label}:{row.id}",
                )
                row.dispatch_status = row.DISPATCH_STATUS_DISPATCHED
                row.claimed_by = None
                row.claimed_at = None
                row.last_error = None
            except Exception as exc:
                print('Error',flush=True)
                print(Exception,flush=True)
                _mark_claim_failed(row, str(exc))
        db.session.commit()

    return claimed_count


def repair_stale_claims(*, lease_seconds: int) -> int:
    threshold = datetime.now(timezone.utc) - timedelta(seconds=lease_seconds)
    repaired = 0

    for target in DISPATCH_TARGETS:
        rows = (
            db.session.query(target.model)
            .filter(
                target.model.dispatch_status == target.model.DISPATCH_STATUS_CLAIMED,
                target.model.claimed_at.isnot(None),
                target.model.claimed_at < threshold,
            )
            .all()
        )
        for row in rows:
            row.dispatch_status = row.DISPATCH_STATUS_PENDING
            row.claimed_by = None
            row.claimed_at = None
            row.dispatch_attempts = int(row.dispatch_attempts or 0) + 1
            row.next_attempt_at = datetime.now(timezone.utc)
            repaired += 1

    return repaired


def _claim_rows(target: DispatchTarget, *, dispatcher_id: str, batch_size: int):
    now = datetime.now(timezone.utc)
    query: Query = (
        db.session.query(target.model)
        .filter(
            target.model.dispatch_status == target.model.DISPATCH_STATUS_PENDING,
            target.model.next_attempt_at <= now,
        )
        .order_by(target.model.id.asc())
        .with_for_update(skip_locked=True)
        .limit(batch_size)
    )

    rows = list(query.all())
    for row in rows:
        row.dispatch_status = row.DISPATCH_STATUS_CLAIMED
        row.claimed_by = dispatcher_id
        row.claimed_at = now

    db.session.flush()
    return rows


def _mark_claim_failed(row, error_message: str) -> None:
    attempts = int(row.dispatch_attempts or 0) + 1
    row.dispatch_attempts = attempts
    row.claimed_by = None
    row.claimed_at = None
    row.last_error = error_message[:3000]
    if attempts >= MAX_DISPATCH_ATTEMPTS:
        row.dispatch_status = row.DISPATCH_STATUS_DEAD
        return

    row.dispatch_status = row.DISPATCH_STATUS_PENDING
    row.next_attempt_at = datetime.now(timezone.utc) + timedelta(seconds=min(300, 15 * attempts))
