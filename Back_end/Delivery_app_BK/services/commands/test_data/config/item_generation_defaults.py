"""
Configuration for random item generation within orders.
Items are generated based on available item types with realistic randomization.
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import Optional


@dataclass
class ItemTypeRanges:
    """Quantity, weight, and dimension ranges for a specific item type."""

    item_type_name: str
    min_quantity: int = 1
    max_quantity: int = 3
    min_weight_kg: float = 1.0  # kg
    max_weight_kg: float = 50.0  # kg
    min_length_cm: float = 20.0  # cm
    max_length_cm: float = 200.0  # cm
    min_width_cm: float = 20.0  # cm
    max_width_cm: float = 150.0  # cm
    min_height_cm: float = 20.0  # cm
    max_height_cm: float = 180.0  # cm


# Default ranges for each item type (vintage furniture company)
DEFAULT_ITEM_TYPE_RANGES = [
    ItemTypeRanges(
        item_type_name="test-Vintage Chairs & Seating",
        min_quantity=1,
        max_quantity=6,  # People order multiple chairs
        min_weight_kg=5.0,
        max_weight_kg=25.0,
        min_length_cm=40.0,
        max_length_cm=60.0,
        min_width_cm=40.0,
        max_width_cm=70.0,
        min_height_cm=70.0,
        max_height_cm=120.0,
    ),
    ItemTypeRanges(
        item_type_name="test-Tables & Desk Collections",
        min_quantity=1,
        max_quantity=2,
        min_weight_kg=15.0,
        max_weight_kg=80.0,
        min_length_cm=80.0,
        max_length_cm=200.0,
        min_width_cm=40.0,
        max_width_cm=120.0,
        min_height_cm=70.0,
        max_height_cm=90.0,
    ),
    ItemTypeRanges(
        item_type_name="test-Storage Solutions",
        min_quantity=1,
        max_quantity=3,
        min_weight_kg=10.0,
        max_weight_kg=100.0,
        min_length_cm=40.0,
        max_length_cm=150.0,
        min_width_cm=30.0,
        max_width_cm=100.0,
        min_height_cm=80.0,
        max_height_cm=200.0,
    ),
    ItemTypeRanges(
        item_type_name="test-Sofas & Couches",
        min_quantity=1,
        max_quantity=2,
        min_weight_kg=30.0,
        max_weight_kg=120.0,
        min_length_cm=150.0,
        max_length_cm=300.0,
        min_width_cm=80.0,
        max_width_cm=150.0,
        min_height_cm=70.0,
        max_height_cm=90.0,
    ),
    ItemTypeRanges(
        item_type_name="test-Decorative Accessories",
        min_quantity=1,
        max_quantity=10,  # People order many small items
        min_weight_kg=0.1,
        max_weight_kg=5.0,
        min_length_cm=10.0,
        max_length_cm=100.0,
        min_width_cm=10.0,
        max_width_cm=80.0,
        min_height_cm=5.0,
        max_height_cm=100.0,
    ),
]

# Global configuration for item generation
DEFAULT_ITEMS_MIN_PER_ORDER = 1
DEFAULT_ITEMS_MAX_PER_ORDER = 10


def build_item_type_ranges_map() -> dict[str, ItemTypeRanges]:
    """Build a map of item type names to their ranges."""
    return {ranges.item_type_name: ranges for ranges in DEFAULT_ITEM_TYPE_RANGES}


def get_range_for_item_type(
    item_type_name: str,
    ranges_map: Optional[dict[str, ItemTypeRanges]] = None,
) -> ItemTypeRanges:
    """Get the range config for a specific item type, or fallback to generic defaults."""
    if ranges_map is None:
        ranges_map = build_item_type_ranges_map()

    if item_type_name in ranges_map:
        return ranges_map[item_type_name]

    # Fallback to generic ranges if type not found
    return ItemTypeRanges(item_type_name=item_type_name)


__all__ = [
    "ItemTypeRanges",
    "DEFAULT_ITEM_TYPE_RANGES",
    "DEFAULT_ITEMS_MIN_PER_ORDER",
    "DEFAULT_ITEMS_MAX_PER_ORDER",
    "build_item_type_ranges_map",
    "get_range_for_item_type",
]
