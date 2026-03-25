"""
Test data defaults for item types and properties.
Designed for a second-hand vintage furniture company.
"""

from __future__ import annotations


# Item properties that will be used by frontend as fast fillers
DEFAULT_ITEM_PROPERTIES = [
    {
        "name": "test-Condition",
        "field_type": "select",
        "options": ["Excellent", "Good", "Fair", "Needs Restoration"],
        "required": True,
    },
    {
        "name": "test-Material",
        "field_type": "select",
        "options": ["Wood", "Metal", "Leather", "Fabric", "Glass", "Mixed"],
        "required": True,
    },
    {
        "name": "test-Era",
        "field_type": "select",
        "options": [
            "Victorian",
            "Art Deco",
            "1950s",
            "1960s",
            "1970s",
            "1980s",
            "Mid-Century Modern",
            "Contemporary",
        ],
        "required": False,
    },
    {
        "name": "test-Color",
        "field_type": "text",
        "options": None,
        "required": False,
    },
    {
        "name": "test-Measurements",
        "field_type": "text",
        "options": None,
        "required": False,
    },
    {
        "name": "test-Price",
        "field_type": "number",
        "options": None,
        "required": False,
    },
    {
        "name": "test-Description",
        "field_type": "text",
        "options": None,
        "required": False,
    },
    {
        "name": "test-Restoration Needed",
        "field_type": "check_box",
        "options": None,
        "required": False,
    },
    {
        "name": "test-Fragile",
        "field_type": "check_box",
        "options": None,
        "required": False,
    },
    {
        "name": "test-Item SKU",
        "field_type": "text",
        "options": None,
        "required": False,
    },
]


# Item types with their associated properties (by property name)
DEFAULT_ITEM_TYPES = [
    {
        "name": "test-Vintage Chairs & Seating",
        "property_names": [
            "test-Condition",
            "test-Material",
            "test-Era",
            "test-Color",
            "test-Price",
            "test-Fragile",
        ],
    },
    {
        "name": "test-Tables & Desk Collections",
        "property_names": [
            "test-Condition",
            "test-Material",
            "test-Measurements",
            "test-Era",
            "test-Price",
        ],
    },
    {
        "name": "test-Storage Solutions",
        "property_names": [
            "test-Condition",
            "test-Material",
            "test-Measurements",
            "test-Price",
            "test-Description",
        ],
    },
    {
        "name": "test-Sofas & Couches",
        "property_names": [
            "test-Condition",
            "test-Material",
            "test-Color",
            "test-Measurements",
            "test-Price",
            "test-Restoration Needed",
        ],
    },
    {
        "name": "test-Decorative Accessories",
        "property_names": [
            "test-Condition",
            "test-Era",
            "test-Color",
            "test-Price",
            "test-Item SKU",
            "test-Fragile",
        ],
    },
]


def build_default_item_properties() -> list[dict]:
    """Return default item property definitions for vintage furniture company."""
    return [prop.copy() for prop in DEFAULT_ITEM_PROPERTIES]


def build_default_item_types() -> list[dict]:
    """Return default item type definitions with associated property names."""
    return [item_type.copy() for item_type in DEFAULT_ITEM_TYPES]


__all__ = [
    "build_default_item_properties",
    "build_default_item_types",
    "DEFAULT_ITEM_PROPERTIES",
    "DEFAULT_ITEM_TYPES",
]
