# Thirs-party dependencies
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship
from sqlalchemy import Column, Integer, String, JSON

# Local application imports
from Delivery_app_BK.models import db
from Delivery_app_BK.models.mixins.team_mixings.team_id import TeamScopedMixin
from Delivery_app_BK.models.mixins.validation_mixins.address_validation import (
    AddressJSONValidationMixin,
)


"""
Facility (v1 → v2 evolution – implementation oriented)

This table represents a physical operational node in the logistics network.
While currently named "Warehouse", the domain intention is to evolve this
into a generalized "Facility" abstraction.

---

V1 Scope (current responsibilities):
- Basic identity (name, client_id, team ownership)
- Physical location (property_location)
- Address validation through AddressJSONValidationMixin

This acts as:
- A reference point for storage or operations
- A foundational entity for routing and logistics features

---

Domain Direction (core concept):

A facility is NOT just storage. It is an operational node in a logistics graph.

It can represent:
- Warehouse → storage
- Depot → dispatch / return hub
- Hub → transfer point
- Pickup point → customer interaction
- Partner facility → external provider

This abstraction enables:
- Multi-depot routing
- AI-driven reasoning
- Constraint-based optimization

---

V2 Implementation (recommended next step)

Below are the extensions that SHOULD be implemented incrementally.

---

1. Type System (low complexity, high value)

Intent:
Define what kind of facility this is.

Usability:
- Enables conditional logic in routing and AI
- Allows polymorphic behavior without table splitting

Implementation:
```
type = Column(String, nullable=False, default="warehouse")
# expected values: warehouse | depot | hub | pickup_point
```

---

2. Operational Constraints (routing critical)

Intent:
Control when and how the facility can operate.

Usability:
- Route feasibility validation
- AI reasoning ("cannot dispatch after hours")

Implementation:
```
operating_hours = Column(JSONB)  
# [{day: "mon", open: "08:00", close: "17:00"}]

can_dispatch = Column(Boolean, default=True)
can_receive_returns = Column(Boolean, default=False)

default_loading_time_seconds = Column(Integer, default=600)
default_unloading_time_seconds = Column(Integer, default=300)
```

---

3. Capacity Modeling (optimization core)

Intent:
Limit how much work a facility can handle.

Usability:
- Prevent route overload
- Enable smarter distribution across facilities

Implementation:
```
max_orders_per_day = Column(Integer)
max_parallel_loadings = Column(Integer)

max_volume_m3 = Column(Integer)
max_weight_kg = Column(Integer)
```

---

4. Capabilities (AI + feature unlock)

Intent:
Define what operations are allowed at this facility.

Usability:
- AI operator decision making
- Feature gating

Implementation:
```
capabilities = Column(JSONB)
# ["storage", "cross_docking", "returns", "packing"]
```

---

5. Routing Integration (domain bridge)

Intent:
Make facility part of routing logic.

Usability:
- Assign start/end of routes
- Multi-depot optimization

Implementation (in other tables, not here):
- route_group.start_facility_id
- route_group.end_facility_id
- zone ↔ facility mapping

---

6. Cost Modeling (advanced optimization)

Intent:
Enable cost-aware routing decisions.

Usability:
- AI recommendations
- Optimization scoring

Implementation:
```
cost_per_order = Column(Integer)
cost_per_hour = Column(Integer)
dispatch_cost = Column(Integer)
```

---

7. External Integrations

Intent:
Link facility to external systems.

Implementation:
```
external_refs = Column(JSONB)
# {shopify_location_id, erp_id}
```

---

Important Notes:
- Implement incrementally, not all at once
- Prioritize: type → operational constraints → routing integration
- This entity will become central to the logistics engine
- Future refactor: rename "warehouse" → "facility"

"""
class Warehouse(db.Model, TeamScopedMixin, AddressJSONValidationMixin):
    __tablename__ = "warehouse"

    __address_fields__ = ( "location" )

    id = Column(Integer, primary_key=True)
    client_id = Column(String, index=True)
    name = Column(String, nullable=False, index=True)

    property_location = Column(JSONB().with_variant(JSON, "sqlite"))  # dict: {city, street_address, postal_code, building_floor, coordinates }


    

    team = relationship(
        "Team",
        backref="ware_houses",
        lazy=True
    )
