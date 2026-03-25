from datetime import datetime, timedelta, timezone


DEFAULT_PLAN_TYPE = "local_delivery"

DEFAULT_CARRIER_NAME = "Test Carrier"
DEFAULT_EVENT_NAME = "test.delivery_plan.event"
DEFAULT_EVENT_ACTION_NAME = "test.delivery_plan.action"

DEFAULT_EVENT_ACTION_STATUS = "PENDING"

# Test plan labels (used for filtering and isolation)
TEST_PLAN_LABELS = {
    "local_delivery": {
        "City Pulse Same-Day Run",
        "Neighborhood Loop Multi-Day Window",
        "Post-Window Overflow Sweep",
    },
    "store_pickup": {
        "Tomorrow Counter Pickup Wave",
    },
    "international_shipping": {
        "Tomorrow Global Dispatch Window",
    },
}


def build_default_plan_payloads(
    now_utc: datetime | None = None,
) -> list[dict]:
    reference = now_utc or datetime.now(timezone.utc)
    today = datetime.combine(reference.date(), datetime.min.time(), tzinfo=timezone.utc)

    local_plan_1_day = today
    local_plan_2_start = today + timedelta(days=1)
    local_plan_2_end = today + timedelta(days=3)
    local_plan_3_day = local_plan_2_end + timedelta(days=1)
    tomorrow = today + timedelta(days=1)

    return [
        {
            "delivery_plan": {
                "plan_type": "local_delivery",
                "label": "City Pulse Same-Day Run",
                "start_date": local_plan_1_day,
                "end_date": local_plan_1_day,
            }
        },
        {
            "delivery_plan": {
                "plan_type": "local_delivery",
                "label": "Neighborhood Loop Multi-Day Window",
                "start_date": local_plan_2_start,
                "end_date": local_plan_2_end,
            }
        },
        {
            "delivery_plan": {
                "plan_type": "local_delivery",
                "label": "Post-Window Overflow Sweep",
                "start_date": local_plan_3_day,
                "end_date": local_plan_3_day,
            }
        },
        {
            "delivery_plan": {
                "plan_type": "store_pickup",
                "label": "Tomorrow Counter Pickup Wave",
                "start_date": tomorrow,
                "end_date": tomorrow,
            }
        },
        {
            "delivery_plan": {
                "plan_type": "international_shipping",
                "label": "Tomorrow Global Dispatch Window",
                "start_date": tomorrow,
                "end_date": tomorrow,
            }
        },
    ]


def build_default_plan_label(sequence: int) -> str:
    return f"Test Plan {sequence}"


__all__ = [
    "DEFAULT_PLAN_TYPE",
    "build_default_plan_payloads",
    "DEFAULT_CARRIER_NAME",
    "DEFAULT_EVENT_NAME",
    "DEFAULT_EVENT_ACTION_NAME",
    "DEFAULT_EVENT_ACTION_STATUS",
    "build_default_plan_label",
    "TEST_PLAN_LABELS",
]