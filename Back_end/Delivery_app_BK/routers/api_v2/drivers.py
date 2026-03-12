from flask import Blueprint, request
from flask_jwt_extended import get_jwt, jwt_required

from Delivery_app_BK.routers.http.response import Response
from Delivery_app_BK.routers.utils.role_decorator import ADMIN, DRIVER, role_required
from Delivery_app_BK.services.context import ServiceContext
from Delivery_app_BK.services.queries.drivers.list_active_routes import (
    list_active_routes as list_active_routes_service,
)
from Delivery_app_BK.services.run_service import run_service


drivers_bp = Blueprint("api_v2_drivers_bp", __name__)


@drivers_bp.route("/routes/active", methods=["GET"])
@jwt_required()
@role_required([ADMIN, DRIVER])
def list_active_routes():
    identity = get_jwt()
    ctx = ServiceContext(
        query_params=request.args,
        identity=identity,
    )

    outcome = run_service(lambda c: list_active_routes_service(c), ctx)
    response = Response()

    if outcome.error:
        return response.build_unsuccessful_response(outcome.error)

    return response.build_successful_response(
        outcome.data,
        warnings=ctx.warnings,
    )
