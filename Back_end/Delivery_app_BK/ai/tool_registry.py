from __future__ import annotations

from Delivery_app_BK.ai.tools.geocode_tools import geocode_address_tool
from Delivery_app_BK.ai.tools.narrative_tools import (
    get_operations_dashboard_tool,
    get_plan_snapshot_tool,
    get_route_group_snapshot_tool,
)
from Delivery_app_BK.ai.tools.order_tools import (
    assign_orders_to_plan_tool,
    assign_orders_to_route_group_tool,
    list_orders_tool,
    update_order_state_tool,
)
from Delivery_app_BK.ai.tools.plan_tools import (
    create_plan_tool,
    list_plans_tool,
    list_route_groups_tool,
    materialize_route_groups_tool,
)
from Delivery_app_BK.ai.tools.zone_tools import (
    evaluate_order_route_fit_tool,
    get_zone_snapshot_tool,
    list_zones_tool,
)

# Tool registry - maps tool name -> callable.
TOOLS: dict[str, object] = {
    # Phase 2: observation and narrative
    "get_plan_snapshot":         get_plan_snapshot_tool,
    "get_route_group_snapshot":  get_route_group_snapshot_tool,
    "get_operations_dashboard":  get_operations_dashboard_tool,
    "evaluate_order_route_fit":  evaluate_order_route_fit_tool,
    "geocode_address":           geocode_address_tool,

    # Phase 3: core query tools
    "list_orders":               list_orders_tool,
    "list_plans":                list_plans_tool,
    "list_route_groups":         list_route_groups_tool,
    "list_zones":                list_zones_tool,
    "get_zone_snapshot":         get_zone_snapshot_tool,

    # Phase 4: mutation tools
    "assign_orders_to_plan":        assign_orders_to_plan_tool,
    "assign_orders_to_route_group": assign_orders_to_route_group_tool,
    "update_order_state":           update_order_state_tool,
    "create_plan":                  create_plan_tool,
    "materialize_route_groups":     materialize_route_groups_tool,

    # order domain - later phases
    # "create_order":         create_order_tool,
    # "update_order":         update_order_tool,
    # "update_order_state":   update_order_state_tool,

    # plan domain - later phases
    # "create_plan":          create_plan_tool,
    # "optimize_plan":        optimize_plan_tool,

    # route group domain - later phases
    # "assign_orders_to_group":    assign_orders_to_group_tool,
    # "materialize_route_groups":  materialize_route_groups_tool,

    # item domain - later phases
    # "search_item_types":    search_item_types_tool,
    # "add_items_to_order":   add_items_to_order_tool,
}
