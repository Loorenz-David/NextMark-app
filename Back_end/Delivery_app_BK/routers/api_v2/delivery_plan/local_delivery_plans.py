from flask import Blueprint, request
from flask_jwt_extended import get_jwt, jwt_required

from Delivery_app_BK.routers.http.response import Response
from Delivery_app_BK.routers.utils.role_decorator import ADMIN, ASSISTANT, role_required
from Delivery_app_BK.services.commands.delivery_plan.local_delivery.update_settings import (
    update_route_group_settings as update_route_group_settings_service,
)
from Delivery_app_BK.services.context import ServiceContext
from Delivery_app_BK.services.queries.route_plan.plan_types.get_route_group_plan_type import (
    get_route_group_plan_type as get_route_group_plan_type_service,
)
from Delivery_app_BK.services.run_service import run_service


local_delivery_plans_bp = Blueprint("api_v2_local_delivery_plans_bp", __name__)


@local_delivery_plans_bp.route("/settings", methods=["PATCH"])
@jwt_required()
@role_required([ADMIN, ASSISTANT])
def update_route_group_settings():
    identity = get_jwt()
    incoming_data = request.get_json(silent=True) or {}
    prevent_event_bus = incoming_data.pop("prevent_event_bus", False)
    ctx = ServiceContext(
        incoming_data=incoming_data,
        identity=identity,
        prevent_event_bus=prevent_event_bus,
    )
    outcome = run_service(
        lambda c: update_route_group_settings_service(c),
        ctx,
    )
    response = Response()

    if outcome.error:
        return response.build_unsuccessful_response(outcome.error)

    return response.build_successful_response(
        outcome.data,
        warnings=ctx.warnings,
    )


# Backward-compatible alias for modules/tests importing old handler symbol.
update_local_delivery_plan_settings = update_route_group_settings


@local_delivery_plans_bp.route("/plans/<int:plan_id>", methods=["GET"])
@jwt_required()
@role_required([ADMIN, ASSISTANT])
def get_route_group_plan_type(plan_id: int):
    identity = get_jwt()
    ctx = ServiceContext(
        query_params=request.args,
        identity=identity,
    )
    outcome = run_service(
        lambda c: get_route_group_plan_type_service(plan_id, c),
        ctx,
    )
    response = Response()

    if outcome.error:
        return response.build_unsuccessful_response(outcome.error)

    return response.build_successful_response(
        outcome.data,
        warnings=ctx.warnings,
    )


# Backward-compatible alias for modules/tests importing old handler symbol.
get_local_delivery_plan_type = get_route_group_plan_type
