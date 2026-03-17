from __future__ import annotations

import os
from typing import Any, Dict

from Delivery_app_BK.errors import ValidationFailed
from Delivery_app_BK.directions.domain.models import DirectionsRequest, DirectionsResult
from Delivery_app_BK.directions.providers.base import DirectionsProvider
from Delivery_app_BK.directions.providers.google.mapper import (
    GoogleDirectionsRequestMapper,
    GoogleDirectionsResponseMapper,
)
import json
import base64
import os
from google.oauth2 import service_account
from google.maps import routing_v2

from google.auth.transport.requests import Request


class GoogleDirectionsProvider(DirectionsProvider):
    name = "google_compute_routes"

    def __init__(self, project_id: str | None = None) -> None:
        project_id = project_id or os.environ.get("GOOGLE_ROUTE_OPTIMIZATION_PROJECT_ID")
        if not project_id:
            raise ValidationFailed("GOOGLE_ROUTE_OPTIMIZATION_PROJECT_ID is not configured.")
        self.project_id = project_id

    def compute(self, request: DirectionsRequest) -> DirectionsResult:

        try:
            from google.maps import routing_v2
        except Exception as exc:  # pragma: no cover - runtime dependency
            raise ValidationFailed("google.maps.routing_v2 is not available.") from exc

        credentials_json = os.environ.get("GOOGLE_SERVICE_ACCOUNT_JSON")
        if not credentials_json:
            raise ValidationFailed("GOOGLE_SERVICE_ACCOUNT_JSON is not configured.")
     
        try:
            credentials_info = json.loads(credentials_json)
            
            if "private_key" in credentials_info:
                credentials_info["private_key"] = credentials_info["private_key"].replace("\\n", "\n")
        except Exception as exc:
            raise ValidationFailed(f"Invalid GOOGLE_SERVICE_ACCOUNT_JSON: {exc}") from exc
        
       

        credentials = service_account.Credentials.from_service_account_info(
            credentials_info,
            scopes=["https://www.googleapis.com/auth/cloud-platform"],
        )

        

        client = routing_v2.RoutesClient(credentials=credentials)

        payload, field_mask = GoogleDirectionsRequestMapper.build_request(request)

        try:
            response = client.compute_routes(
                request=payload,
                metadata=[("x-goog-fieldmask", field_mask)],
            )
        except Exception as exc:
            raise ValidationFailed(f"Google compute_routes failed: {exc}") from exc

        return GoogleDirectionsResponseMapper.parse_response(response, request)
