from dataclasses import dataclass
from typing import Optional

from Delivery_app_BK.domain.vehicle.travel_mode import validate_travel_mode
from Delivery_app_BK.domain.vehicle.fuel_type import validate_fuel_type
from Delivery_app_BK.errors import ValidationFailed


@dataclass
class VehicleCreateRequest:
    registration_number: str
    label: Optional[str] = None
    fuel_type: Optional[str] = None
    travel_mode: Optional[str] = None
    max_volume_load_cm3: Optional[int] = None
    max_weight_load_g: Optional[int] = None
    max_speed_kmh: Optional[float] = None
    cost_per_km: float = 0
    cost_per_hour: float = 0
    travel_distance_limit_km: Optional[int] = None
    travel_duration_limit_minutes: Optional[int] = None


@dataclass
class VehicleUpdateFields:
    registration_number: Optional[str] = None
    label: Optional[str] = None
    fuel_type: Optional[str] = None
    travel_mode: Optional[str] = None
    max_volume_load_cm3: Optional[int] = None
    max_weight_load_g: Optional[int] = None
    max_speed_kmh: Optional[float] = None
    cost_per_km: Optional[float] = None
    cost_per_hour: Optional[float] = None
    travel_distance_limit_km: Optional[int] = None
    travel_duration_limit_minutes: Optional[int] = None


def parse_create_vehicle_request(raw: dict) -> VehicleCreateRequest:
    registration_number = (raw.get("registration_number") or "").strip()
    if not registration_number:
        raise ValidationFailed("registration_number is required.")

    travel_mode = validate_travel_mode(raw.get("travel_mode"))
    fuel_type = validate_fuel_type(raw.get("fuel_type"))

    return VehicleCreateRequest(
        registration_number=registration_number,
        label=raw.get("label") or None,
        fuel_type=fuel_type,
        travel_mode=travel_mode,
        max_volume_load_cm3=raw.get("max_volume_load_cm3"),
        max_weight_load_g=raw.get("max_weight_load_g"),
        max_speed_kmh=raw.get("max_speed_kmh"),
        cost_per_km=raw.get("cost_per_km", 0) or 0,
        cost_per_hour=raw.get("cost_per_hour", 0) or 0,
        travel_distance_limit_km=raw.get("travel_distance_limit_km"),
        travel_duration_limit_minutes=raw.get("travel_duration_limit_minutes"),
    )


def parse_update_vehicle_request(raw: dict) -> VehicleUpdateFields:
    fields = {}

    if "registration_number" in raw:
        val = (raw["registration_number"] or "").strip()
        if not val:
            raise ValidationFailed("registration_number cannot be empty.")
        fields["registration_number"] = val

    if "travel_mode" in raw:
        fields["travel_mode"] = validate_travel_mode(raw["travel_mode"])

    if "fuel_type" in raw:
        fields["fuel_type"] = validate_fuel_type(raw["fuel_type"])

    for key in (
        "label",
        "max_volume_load_cm3",
        "max_weight_load_g",
        "max_speed_kmh",
        "cost_per_km",
        "cost_per_hour",
        "travel_distance_limit_km",
        "travel_duration_limit_minutes",
    ):
        if key in raw:
            fields[key] = raw[key]

    return VehicleUpdateFields(**{k: v for k, v in fields.items()})
