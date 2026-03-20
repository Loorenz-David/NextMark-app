from .tools.plan_tools import (
    optimize_plan_tool,
    get_plan_summary_tool,
    list_plans_tool,
    create_plan_tool,
)
from .tools.order_tools import (
    list_orders_tool,
    assign_orders_to_plan_tool,
    assign_orders_tool,
)

TOOLS: dict[str, callable] = {
    "optimize_plan": optimize_plan_tool,
    "get_plan_summary": get_plan_summary_tool,
    "list_plans": list_plans_tool,
    "create_plan": create_plan_tool,
    "list_orders": list_orders_tool,
    "assign_orders_to_plan": assign_orders_to_plan_tool,
    "assign_orders": assign_orders_tool,
}
