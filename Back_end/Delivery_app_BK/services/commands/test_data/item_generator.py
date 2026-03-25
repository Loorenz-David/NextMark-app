"""
Random item generator for orders based on available item types.
"""

from __future__ import annotations

import random
from typing import Any

from Delivery_app_BK.models import ItemType, db
from Delivery_app_BK.services.context import ServiceContext

from .config.item_generation_defaults import (
    DEFAULT_ITEMS_MAX_PER_ORDER,
    DEFAULT_ITEMS_MIN_PER_ORDER,
    ItemTypeRanges,
    build_item_type_ranges_map,
    get_range_for_item_type,
)


def generate_random_items(
    ctx: ServiceContext,
    min_items: int = DEFAULT_ITEMS_MIN_PER_ORDER,
    max_items: int = DEFAULT_ITEMS_MAX_PER_ORDER,
    ranges_map: dict[str, ItemTypeRanges] | None = None,
    seed: int | None = None,
) -> list[dict]:
    """
    Generate a random list of items for an order based on available item types.
    
    Args:
        ctx: ServiceContext with team_id for filtering item types
        min_items: Minimum items to generate (default: 1)
        max_items: Maximum items to generate (default: 10)
        ranges_map: Optional custom ranges map for item types
        seed: Optional seed for reproducible randomization (for testing)
    
    Returns:
        List of item dicts with randomly selected type, properties, quantity, weight, dimensions
    """
    if seed is not None:
        random.seed(seed)

    # Load available item types from DB
    available_types = _load_available_item_types(ctx)
    if not available_types:
        return []

    if ranges_map is None:
        ranges_map = build_item_type_ranges_map()

    # Determine how many items to generate for this order
    num_items = random.randint(min_items, max_items)

    items: list[dict] = []
    for _ in range(num_items):
        # Randomly select an item type
        selected_type = random.choice(available_types)

        # Get ranges for this type
        type_ranges = get_range_for_item_type(selected_type.name, ranges_map)

        # Generate random quantity, weight, dimensions
        quantity = random.randint(type_ranges.min_quantity, type_ranges.max_quantity)
        weight_kg = random.uniform(type_ranges.min_weight_kg, type_ranges.max_weight_kg)
        length_cm = random.uniform(type_ranges.min_length_cm, type_ranges.max_length_cm)
        width_cm = random.uniform(type_ranges.min_width_cm, type_ranges.max_width_cm)
        height_cm = random.uniform(type_ranges.min_height_cm, type_ranges.max_height_cm)

        # Randomly select 1-3 properties from the item type's available properties
        num_properties = random.randint(1, min(3, len(selected_type.properties)))
        selected_properties = random.sample(selected_type.properties, num_properties)

        # Build property values dict
        property_values = {}
        for prop in selected_properties:
            property_values[prop.name] = _generate_property_value(prop)

        # Build the item dict
        article_number = f"TEST-{selected_type.id}-{random.randint(100000, 999999)}"
        item = {
            "article_number": article_number,
            "item_type": selected_type.name,
            "quantity": quantity,
            "weight": int(round(weight_kg * 1000)),
            "dimension_depth": int(round(length_cm)),
            "dimension_width": int(round(width_cm)),
            "dimension_height": int(round(height_cm)),
            "properties": property_values,
        }
        items.append(item)

    return items


def _load_available_item_types(ctx: ServiceContext) -> list[ItemType]:
    """Load all item types marked as test data from the database."""
    from .config import TEST_PLAN_LABELS  # Import here to avoid circular deps

    # Get all test item type names
    test_item_type_names = [
        "test-Vintage Chairs & Seating",
        "test-Tables & Desk Collections",
        "test-Storage Solutions",
        "test-Sofas & Couches",
        "test-Decorative Accessories",
    ]

    query = db.session.query(ItemType).filter(ItemType.name.in_(test_item_type_names))

    if isinstance(ctx.team_id, int):
        query = query.filter(ItemType.team_id == ctx.team_id)

    return query.all()


def _generate_property_value(prop: Any) -> str | bool | int | float | list[str]:
    """Generate a realistic random value for a property based on its field type."""
    if prop.field_type == "select":
        # Return a random option from the property's options
        if isinstance(prop.options, list) and prop.options:
            return random.choice(prop.options)

        # Backward compatibility for legacy options format: {"values": [...]}.
        if prop.options and isinstance(prop.options, dict):
            values = prop.options.get("values", [])
            if isinstance(values, list) and values:
                return random.choice(values)
        return "Unknown"

    elif prop.field_type == "check_box":
        # 60% chance True, 40% chance False
        return random.random() < 0.6

    elif prop.field_type == "number":
        # Random integer between 1 and 100
        return random.randint(1, 100)

    elif prop.field_type == "text":
        # Return a descriptive text value based on property name
        descriptors = {
            "Color": ["Red", "Blue", "Green", "Brown", "Black", "White", "Beige", "Gray"],
            "Condition": ["Excellent", "Good", "Fair"],
            "Material": ["Wood", "Metal", "Leather", "Fabric"],
            "Era": ["Victorian", "Art Deco", "Mid-Century"],
            "Description": [
                "Well-maintained",
                "Shows signs of age",
                "Vintage charm",
                "Restored",
                "Original patina",
            ],
            "SKU": [f"SKU-{random.randint(10000, 99999)}" for _ in range(1)],
        }

        # Find matching descriptor by property name
        for key, values in descriptors.items():
            if key.lower() in prop.name.lower():
                return random.choice(values)

        # Default text
        return f"Value-{random.randint(1, 1000)}"

    return "N/A"


__all__ = [
    "generate_random_items",
]
