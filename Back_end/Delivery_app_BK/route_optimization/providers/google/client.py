from __future__ import annotations

import os
from typing import Any, Dict

from google.maps import routeoptimization_v1
from google.protobuf.json_format import MessageToDict

from Delivery_app_BK.errors import ValidationFailed
from Delivery_app_BK.route_optimization.domain.models import (
    OptimizationRequest,
    OptimizationResult,
)
from Delivery_app_BK.route_optimization.providers.base import RouteOptimizationProvider
from Delivery_app_BK.route_optimization.providers.google.mapper import (
    GoogleRequestMapper,
    GoogleResponseMapper,
)


import json
import os
from google.oauth2 import service_account
from google.maps import routeoptimization_v1


class GoogleRouteOptimizationProvider(RouteOptimizationProvider):
    name = "google_route_optimization"

    def __init__(self, project_id: str | None = None, location: str | None = None) -> None:
        project_id = project_id or os.environ.get("GOOGLE_ROUTE_OPTIMIZATION_PROJECT_ID")
        location = location or os.environ.get("GOOGLE_ROUTE_OPTIMIZATION_LOCATION", "us-central1")

        if not project_id:
            raise ValidationFailed("GOOGLE_ROUTE_OPTIMIZATION_PROJECT_ID is not configured.")

        credentials_json = os.environ.get("GOOGLE_SERVICE_ACCOUNT_JSON")

        if not credentials_json:
            raise ValidationFailed("GOOGLE_APPLICATION_CREDENTIALS is not configured.")

        credentials = service_account.Credentials.from_service_account_info(
            json.loads(credentials_json)
        )

        self.parent = f"projects/{project_id}"
        self.location = location

        self.client = routeoptimization_v1.RouteOptimizationClient(
            credentials=credentials
        )