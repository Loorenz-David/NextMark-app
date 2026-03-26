from typing import Type,List
from flask_sqlalchemy.model import Model
from Delivery_app_BK.models import RoutePlan

from ...context import ServiceContext
from ..utils import map_return_values, calculate_plan_metrics


def serialize_plans( instances: List[ Type[ RoutePlan ] ], ctx:ServiceContext  ):
    
    unpacked_instances = []

    for instance in instances:
        start_date = instance.start_date
        end_date = instance.end_date
        created_at = instance.created_at
        unpacked = {
            "id": instance.id,
            "client_id": instance.client_id,
            "label": instance.label,
            "date_strategy": instance.date_strategy,
            "start_date": start_date.isoformat() if start_date else None,
            "end_date": end_date.isoformat() if end_date else None,
            "created_at": created_at.isoformat() if created_at else None,
            "updated_at": instance.updated_at.isoformat() if instance.updated_at else None,
            "state_id": instance.state_id
        }
        unpacked.update(calculate_plan_metrics(instance))
        if instance.total_orders is not None:
            unpacked.update({
                "total_weight": instance.total_weight_g,
                "total_volume": instance.total_volume_cm3,
                "total_items": instance.total_item_count,
                "total_orders": instance.total_orders,
            })

        unpacked_instances.append( unpacked )

    return map_return_values(unpacked_instances, ctx, "delivery_plan")
