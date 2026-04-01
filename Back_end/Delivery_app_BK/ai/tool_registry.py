from __future__ import annotations

# Tool registry - maps tool name -> callable.
# Populated as tools are implemented in Phase 2+.
# Import each tool function here and add to TOOLS when ready.

TOOLS: dict[str, object] = {
    # order domain
    # "list_orders":          list_orders_tool,
    # "create_order":         create_order_tool,
    # "update_order":         update_order_tool,
    # "update_order_state":   update_order_state_tool,

    # plan domain
    # "list_plans":           list_plans_tool,
    # "get_plan_summary":     get_plan_summary_tool,
    # "create_plan":          create_plan_tool,
    # "optimize_plan":        optimize_plan_tool,

    # route group domain
    # "list_route_groups":         list_route_groups_tool,
    # "assign_orders_to_group":    assign_orders_to_group_tool,
    # "materialize_route_groups":  materialize_route_groups_tool,

    # zone domain
    # "list_zones":           list_zones_tool,
    # "get_zone_snapshot":    get_zone_snapshot_tool,

    # narrative / stats
    # "get_plan_snapshot":         get_plan_snapshot_tool,
    # "get_operations_dashboard":  get_operations_dashboard_tool,

    # item domain
    # "search_item_types":    search_item_types_tool,
    # "add_items_to_order":   add_items_to_order_tool,
}
