from Delivery_app_BK.errors import ValidationFailed
from Delivery_app_BK.services.commands.order.order_case.create_order_case import (
    create_order_case,
)
from Delivery_app_BK.services.commands.order.order_case.order_chat.create_case_chat import (
    create_case_chat,
)
from Delivery_app_BK.services.commands.order.order_states.update_orders_state import (
    update_orders_state,
)
from Delivery_app_BK.services.context import ServiceContext
from Delivery_app_BK.services.domain.order.order_states import OrderStateId

from ._helpers import resolve_driver_action_order_stop
from .serializers import (
    serialize_driver_order_command_delta,
)


def _extract_created_id(mapping: dict) -> int:
    for key, value in mapping.items():
        if key == "ids_without_match":
            continue
        if isinstance(value, int):
            return value
        if isinstance(value, dict) and isinstance(value.get("id"), int):
            return value["id"]
    raise ValidationFailed("Could not resolve created instance id.")


def fail_driver_order(ctx: ServiceContext, order_id: int):
    incoming_data = ctx.incoming_data or {}
    description = incoming_data.get("description")
    order_case_payload = incoming_data.get("order_case") or {}
    case_chat_payload = incoming_data.get("case_chat") or {}
    if not isinstance(description, str) or not description.strip():
        raise ValidationFailed("description is required.")

    order, _stop = resolve_driver_action_order_stop(ctx, order_id)

    changed_orders = update_orders_state(
        ctx=ctx,
        orders=[order],
        state_id=OrderStateId.FAIL,
    )

    case_ctx = ServiceContext(
        incoming_data={
            "fields": {
                "order_id": order.id,
                "client_id": order_case_payload.get("client_id"),
            }
        },
        identity=ctx.identity,
        check_team_id=ctx.check_team_id,
        inject_team_id=ctx.inject_team_id,
        skip_id_instance_injection=ctx.skip_id_instance_injection,
        on_create_return="map_ids_object",
    )
    case_result = create_order_case(case_ctx)
    case_id = _extract_created_id(case_result["order_case"])

    chat_ctx = ServiceContext(
        incoming_data={
            "fields": {
                "order_case_id": case_id,
                "message": description.strip(),
                "client_id": case_chat_payload.get("client_id"),
            },
        },
        identity=ctx.identity,
        check_team_id=ctx.check_team_id,
        inject_team_id=ctx.inject_team_id,
        skip_id_instance_injection=ctx.skip_id_instance_injection,
        on_create_return="map_ids_object",
    )
    chat_result = create_case_chat(chat_ctx)
    chat_id = _extract_created_id(chat_result["case_chat"])

    return {
        "orders": serialize_driver_order_command_delta(
            instances=changed_orders,
            ctx=ctx,
        ),
        "order_case": {"id": case_id},
        "case_chat": {"id": chat_id},
    }
