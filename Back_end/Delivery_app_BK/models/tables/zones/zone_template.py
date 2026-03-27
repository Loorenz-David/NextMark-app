from datetime import datetime, timezone

from sqlalchemy import JSON, Boolean, Column, ForeignKey, Integer, String
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship

from Delivery_app_BK.models import db
from Delivery_app_BK.models.utils import UTCDateTime


class ZoneTemplate(db.Model):
    """Reusable operational defaults attached to a zone definition."""

    __tablename__ = "zone_template"

    id = Column(Integer, primary_key=True)
    team_id = Column(Integer, ForeignKey("team.id", ondelete="CASCADE"), nullable=False, index=True)
    zone_id = Column(Integer, ForeignKey("zone.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(255), nullable=False)
    config_json = Column(JSONB().with_variant(JSON, "sqlite"), nullable=False, default=dict)
    version = Column(Integer, nullable=False, default=1)
    is_active = Column(Boolean, nullable=False, default=True)
    created_at = Column(UTCDateTime, nullable=False, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(
        UTCDateTime,
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    zone = relationship("Zone", back_populates="templates")
