"""
Zone attribution stub.

Phase 4 will replace this with a real majority-stop or centroid-based
strategy that maps a RouteSolution to a zone_id (integer FK to zones table).
"""
from typing import Optional


def derive_route_zone(route_solution) -> Optional[int]:
    """Return the zone_id for a given route solution, or None if undetermined.

    TODO Phase 4: implement majority-stop or centroid-polygon strategy.
    """
    return None
