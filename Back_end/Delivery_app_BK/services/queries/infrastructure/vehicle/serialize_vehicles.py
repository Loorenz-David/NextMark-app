from typing import List
from Delivery_app_BK.models import Vehicle

from ....context import ServiceContext
from ...utils import map_return_values


def serialize_vehicles(instances: List[Vehicle], ctx: ServiceContext):
    unpacked_instances = []

    for instance in instances:
        unpacked = {
            "id": instance.id,
            "client_id": instance.client_id,
            "registration_number": instance.registration_number,
            "label": instance.label,
            "fuel_type": instance.fuel_type,
            "travel_mode": instance.travel_mode,
            "max_volume_load_cm3": instance.max_volume_load_cm3,
            "max_weight_load_g": instance.max_weight_load_g,
            "max_speed_kmh": instance.max_speed_kmh,
            "cost_per_km": instance.cost_per_km,
            "cost_per_hour": instance.cost_per_hour,
            "travel_distance_limit_km": instance.travel_distance_limit_km,
            "travel_duration_limit_minutes": instance.travel_duration_limit_minutes,
            "is_system": instance.is_system,
            "team_id": instance.team_id,
        }
        unpacked_instances.append(unpacked)

    return map_return_values(unpacked_instances, ctx, "vehicle")
