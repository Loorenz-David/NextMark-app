# Third-party dependecies
from datetime import datetime, timezone

from sqlalchemy import Column, Float, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

# Local application import

from Delivery_app_BK.models import db
from Delivery_app_BK.models.mixins.team_mixings.team_id import TeamScopedMixin
from Delivery_app_BK.models.utils import UTCDateTime





class RouteGroup(db.Model, TeamScopedMixin):
    __tablename__ = "route_group"

    id = Column(Integer, primary_key=True)
    client_id = Column(String, index=True)

    
    # record of the actual start and end time after completion.
    actual_start_time = Column(UTCDateTime)
    actual_end_time = Column(UTCDateTime)
    updated_at = Column(
        UTCDateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )
 
    

    driver_id = Column(Integer, ForeignKey("user.id"))

    route_plan_id = Column(
        Integer,
        ForeignKey("route_plan.id", ondelete="CASCADE"),
        unique=True,
        nullable=False,
    )

    state_id = Column(Integer, ForeignKey("plan_state.id", ondelete="SET NULL"))

    total_weight_g = Column(Float, nullable=True)
    total_volume_cm3 = Column(Float, nullable=True)
    total_item_count = Column(Integer, nullable=True)
    total_orders = Column(Integer, nullable=True)

    

    route_solutions = relationship(
        "RouteSolution",
        back_populates="route_group",
        cascade="all, delete-orphan",
    )

    driver = relationship(
        "User",
        back_populates="route_groups",
    )

    route_plan = relationship(
        "RoutePlan",
        back_populates="route_group",
    )

    state = relationship(
        "RoutePlanState",
        back_populates="route_groups",
        lazy="selectin",
    )

    team = relationship(
        "Team",
        backref="route_groups",
        lazy=True,
    )
