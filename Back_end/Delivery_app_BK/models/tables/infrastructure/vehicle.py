# Third-party dependencies
from sqlalchemy.orm import relationship
from sqlalchemy import Column, Integer, String, Float, Boolean

# Local application imports
from Delivery_app_BK.models import db
from Delivery_app_BK.models.mixins.team_mixings.team_id import TeamScopedMixin


class Vehicle(db.Model, TeamScopedMixin):
    __tablename__ = "vehicle"

    id = Column(Integer, primary_key=True)
    client_id = Column(String, index=True)

    registration_number = Column(String, nullable=False, index=True)
    label = Column(String, nullable=True)

    fuel_type = Column(String, nullable=True)
    travel_mode = Column(String, nullable=True)

    max_volume_load_cm3 = Column(Integer, nullable=True)
    max_weight_load_g = Column(Integer, nullable=True)
    max_speed_kmh = Column(Float, nullable=True)

    cost_per_km = Column(Float, default=0)
    cost_per_hour = Column(Float, default=0)

    travel_distance_limit_km = Column(Integer, nullable=True)
    travel_duration_limit_minutes = Column(Integer, nullable=True)

    is_system = Column(Boolean, default=False, index=True)

    team = relationship(
        "Team",
        backref="vehicles",
        lazy=True,
    )
