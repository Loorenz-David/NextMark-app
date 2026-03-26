"""Point-to-zone resolution service for order coordinates."""

import math
from typing import Optional
from Delivery_app_BK.models.tables.zones.zone import Zone


def haversine_distance(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    """
    Calculate haversine distance between two coordinates in kilometers.
    
    Args:
        lat1, lng1: First coordinate
        lat2, lng2: Second coordinate
        
    Returns:
        Distance in kilometers
    """
    R = 6371  # Earth radius in km
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lng2 - lng1)
    
    a = math.sin(delta_phi / 2) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda / 2) ** 2
    c = 2 * math.asin(math.sqrt(a))
    
    return R * c


def resolve_point_to_zone(
    zone_version_id: int,
    lat: float,
    lng: float,
    priority_types: list = None,
) -> Optional[Zone]:
    """
    Resolve a point (lat/lng) to a zone within a specific zone version.
    
    Resolution strategy:
    1. Filter zones by zone_type priority (if specified, defaults to user > system > bootstrap)
    2. Pre-filter by bounding box (bbox columns for efficiency)
    3. Find closest zone by centroid distance
    
    This is a centroid-based fallback. More sophisticated point-in-polygon
    checks can be added later with PostGIS spatial indexing.
    
    Args:
        zone_version_id: Zone version to search in
        lat: Delivery latitude
        lng: Delivery longitude
        priority_types: List of zone_type values in priority order (e.g., ["user", "system", "bootstrap"])
                       Defaults to ["user", "system", "bootstrap"]
        
    Returns:
        Closest Zone within the version, or None if no zones exist
    """
    if priority_types is None:
        priority_types = ["user", "system", "bootstrap"]
    
    # Build query starting with zone_version and is_active filter
    query = Zone.query.filter(
        Zone.zone_version_id == zone_version_id,
        Zone.is_active == True,
    )
    
    # Apply type priority: construct CASE expression to order by type
    # We'll fetch all zones and sort in Python for simplicity
    zones = query.all()
    
    if not zones:
        return None
    
    # Sort by priority type first, then by distance
    type_priority = {zone_type: idx for idx, zone_type in enumerate(priority_types)}
    
    best_zone = None
    best_distance = float('inf')
    best_priority = float('inf')
    
    for zone in zones:
        # Get priority for this zone's type (higher number = lower priority)
        priority = type_priority.get(zone.zone_type, len(priority_types))
        
        # Skip if this zone has worse priority than our current best
        # Or if equal priority, only check distance
        if priority > best_priority:
            continue
        
        # Calculate centroid distance
        centroid = zone.centroid
        if not centroid or not isinstance(centroid, dict):
            continue
            
        lat_c = centroid.get('lat')
        lng_c = centroid.get('lng')
        if lat_c is None or lng_c is None:
            continue
        
        distance = haversine_distance(lat, lng, lat_c, lng_c)
        
        # Update best if:
        # - Same priority but closer, or
        # - Better priority (lower number)
        if priority < best_priority or (priority == best_priority and distance < best_distance):
            best_zone = zone
            best_distance = distance
            best_priority = priority
    
    return best_zone
