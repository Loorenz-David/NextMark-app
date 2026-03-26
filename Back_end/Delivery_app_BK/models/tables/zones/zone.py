from datetime import datetime, timezone

from sqlalchemy import Boolean, Column, Enum, Float, Index, Integer, String
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy import JSON

from Delivery_app_BK.models import db
from Delivery_app_BK.models.utils import UTCDateTime


class Zone(db.Model):
    """Versioned spatial zone shared across analytics and other domains."""

    __tablename__ = "zone"

    __table_args__ = (
        Index("ix_zone_team_version_active", "team_id", "zone_version_id", "is_active"),
        Index("ix_zone_team_city_version", "team_id", "city_key", "zone_version_id"),
        Index(
            "ix_zone_bbox_lookup",
            "team_id",
            "city_key",
            "zone_version_id",
            "min_lat",
            "max_lat",
            "min_lng",
            "max_lng",
        ),
    )

    id = Column(Integer, primary_key=True)
    team_id = Column(Integer, db.ForeignKey("team.id", ondelete="CASCADE"), nullable=False, index=True)
    zone_version_id = Column(
        Integer,
        db.ForeignKey("zone_version.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    city_key = Column(String(255), nullable=False, index=True)
    name = Column(String(255), nullable=False)
    zone_type = Column(
        Enum("bootstrap", "system", "user", name="zone_type_enum"),
        nullable=False,
    )
    centroid_lat = Column(Float, nullable=True)
    centroid_lng = Column(Float, nullable=True)
    geometry = Column(JSONB().with_variant(JSON, "sqlite"), nullable=True)
    min_lat = Column(Float, nullable=True)
    max_lat = Column(Float, nullable=True)
    min_lng = Column(Float, nullable=True)
    max_lng = Column(Float, nullable=True)
    is_active = Column(Boolean, nullable=False, default=True)
    created_at = Column(
        UTCDateTime,
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
    )
    updated_at = Column(
        UTCDateTime,
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )
