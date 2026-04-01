# AI Logistics Operator - Architecture Reference

> Maintenance rule: Update this file after every build, modification, or removal in the ai/ module.
> This document is the source of truth for understanding, extending, and maintaining the AI operator.

---

## What This Is

The AI Logistics Operator is not a chatbot. It is a multi-step tool-calling agent with persistent conversation threads:

User input -> Thread store (Redis) -> Planner (LLM) -> selects tool -> Backend executes -> result back to LLM -> repeat -> format response -> persist

The LLM decides what to do. The backend decides how to do it safely. The AI never touches the database directly.

---

## Module Structure

Delivery_app_BK/ai/
- AI_OPERATOR.md
- orchestrator.py
- planner.py
- thread_store.py
- response_formatter.py
- tool_registry.py
- tool_executor.py
- schemas.py
- errors.py
- prompts/system_prompt.py
- providers/base.py
- providers/openai_provider.py
- providers/anthropic_provider.py
- providers/gemini_provider.py
- tools/plan_tools.py
- tools/order_tools.py
- tools/item_tools.py
- tools/zone_tools.py
- tools/narrative_tools.py
- tools/geometry_utils.py
- tools/plan_execution/__init__.py
- tools/plan_execution/local_delivery_handler.py
- tools/plan_execution/international_shipping_handler.py
- tools/plan_execution/store_pickup_handler.py

---

## Request Flow (V2 Thread-Based)

1. POST /api_v2/ai/threads -> create thread
2. POST /api_v2/ai/threads/<id>/messages -> run planner loop and persist turns
3. GET /api_v2/ai/threads/<id> -> rehydrate thread

Flow details:
1. Router validates thread access (user_id + app_scope)
2. User turn stored in Redis
3. build_system_prompt() creates live prompt with state maps
4. orchestrator runs planner loop (max steps)
5. Planner emits either tool call or final message
6. tool_executor executes registered tool
7. Tool turns are stored
8. response_formatter builds tool_trace, actions, blocks, and payload
9. Assistant turn is stored

Infrastructure modules remain unchanged in this phase:
- orchestrator.py
- planner.py
- thread_store.py
- errors.py
- providers/

---

## Domain Model (Current)

### RoutePlan
- Top-level operation window
- date_strategy: single | range
- state lifecycle: Open -> Ready -> Processing -> Completed | Fail
- Contains RouteGroups
- Denormalized totals: total_orders, total_item_count, total_weight_g, total_volume_cm3, item_type_counts

### RouteGroup
- Operative unit inside RoutePlan
- Orders belong to RouteGroup (not directly to plan semantics)
- Linked to Zone or default bucket (is_system_default_bucket=true)
- Can have multiple RouteSolutions; one selected active solution
- Denormalized totals: total_orders, order_state_counts, total_item_count, item_type_counts

### Order
- Belongs to RoutePlan and RouteGroup
- order_plan_objective: local_delivery | international_shipping | store_pickup
- operation_type: pickup | dropoff | pickup_dropoff
- Denormalized totals: total_item_count, total_weight_g, total_volume_cm3, item_type_counts

### Zone
- Geographic polygon scope
- Backed by ZoneTemplate defaults (capacity, windows, ETA tolerances, preferred vehicles)
- Versioned with single active version per team+city

### OrderZoneAssignment
- assignment_type: auto | manual
- is_unassigned=true means no zone placement

### RouteSolution
- Optimization output for a RouteGroup
- Contains ordered RouteSolutionStops
- Carries ETA/actual timing fields

---

## Narrative-First Output Pattern

Narrative statistics are now a primary output contract.
Tools can return structured blocks and the final response includes both:
- human-readable assistant content
- machine-renderable NarrativeBlock list

Narrative behavior requirements:
- Synthesize data into meaningful insights, not raw dumps
- Highlight risks/anomalies
- Recommend next actions when appropriate

---

## Registered Tools (Phase 5)

| Tool name | File | Domain service |
|---|---|---|
| `get_plan_snapshot` | `tools/narrative_tools.py` | `queries/route_plan/get_plan.py` + `route_groups/list_route_groups.py` |
| `get_route_group_snapshot` | `tools/narrative_tools.py` | `queries/route_plan/route_groups/get_route_group.py` |
| `get_operations_dashboard` | `tools/narrative_tools.py` | `queries/route_plan/find_plans.py` |
| `evaluate_order_route_fit` | `tools/zone_tools.py` | direct `RouteSolution` + `Order` query + `tools/geometry_utils.py` |
| `geocode_address` | `tools/geocode_tools.py` | `geocoding/orchestrator.py` |
| `list_orders` | `tools/order_tools.py` | `queries/order/list_orders.py` |
| `list_plans` | `tools/plan_tools.py` | `queries/route_plan/find_plans.py` + `serialize_plan.py` |
| `list_route_groups` | `tools/plan_tools.py` | `queries/route_plan/route_groups/list_route_groups.py` |
| `list_zones` | `tools/zone_tools.py` | `queries/zones/find_zones.py` + `ZoneTemplate` query |
| `get_zone_snapshot` | `tools/zone_tools.py` | `Zone` + `OrderZoneAssignment` + `RouteGroup` query |
| `assign_orders_to_plan` | `tools/order_tools.py` | `commands/order/update_order_route_plan.py` -> `apply_orders_route_plan_change` |
| `assign_orders_to_route_group` | `tools/order_tools.py` | same command, with `destination_route_group_id` |
| `update_order_state` | `tools/order_tools.py` | `commands/order/order_states/update_orders_state.py` -> `update_orders_state_payload` |
| `create_plan` | `tools/plan_tools.py` | `commands/route_plan/create_plan.py` -> `create_plan` |
| `materialize_route_groups` | `tools/plan_tools.py` | `commands/route_plan/materialize_route_groups.py` -> `materialize_route_groups` |
| `search_item_types` | `tools/item_tools.py` | `queries/item_type/list_item_types.py` -> `list_item_types` |
| `add_items_to_order` | `tools/item_tools.py` | `commands/item/create/create_item.py` -> `create_item` |
| `create_order` | `tools/order_tools.py` | `commands/order/create_order.py` -> `create_order` |

---

## Prompt Architecture

prompts/system_prompt.py contains:
- ORDER_STATE_MAP and PLAN_STATE_MAP built from domain enums
- _PROMPT_TEMPLATE with domain knowledge and safety rules
- build_system_prompt() for runtime state injection
- PLANNER_SYSTEM_PROMPT fallback constant

Current prompt policy:
- Domain knowledge + registered tool documentation
- Tool docs added as tools are implemented and registered in Phase 2+

---

## Schemas Contract (V2)

schemas.py keeps only V2 thread contracts and adds NarrativeBlock.

Key models:
- AIThreadMetadata
- AIThreadTurn
- AIToolTraceEntry
- AIAction
- AIThreadCreateResponse
- AIThreadMessageRequest
- AIThreadMessagePayload
- AIThreadMessageResponse
- AIThreadGetResponse
- NarrativeBlock

NarrativeBlock:
- type: text | stat_kpi | stat_trend | stat_breakdown | insight | warning | recommendation
- label: optional
- value: any
- meta: optional dict

AIThreadMessagePayload includes:
- blocks: list[NarrativeBlock] | None
- data: dict | None

---

## Response Formatter Architecture

response_formatter.py is registry-driven and deterministic:

1. _SUMMARY_REGISTRY
- tool_name -> summary function(tool_params, tool_result) -> str

2. _ACTION_REGISTRY
- tool_name -> action generator(tool_result) -> list[AIAction]

3. collect_blocks(tool_turns)
- extracts tool_result["blocks"]
- validates each block via NarrativeBlock
- silently skips malformed blocks

No hardcoded per-tool if/elif chains remain.
No special-case analytics block mapper remains.

---

## Plan Execution Strategy Skeleton

tools/plan_execution/__init__.py provides:
- HANDLERS map for local_delivery, international_shipping, store_pickup
- get_handler(plan_type)

Handlers status:
- local_delivery_handler.py: skeleton NotImplementedError
- international_shipping_handler.py: stub returns not_implemented
- store_pickup_handler.py: stub returns not_implemented

---

## Tool File Status (Phase 5)

Implemented:
- tools/narrative_tools.py  (get_plan_snapshot, get_route_group_snapshot, get_operations_dashboard)
- tools/zone_tools.py       (evaluate_order_route_fit, list_zones, get_zone_snapshot)
- tools/geocode_tools.py    (geocode_address — pre-existing, registered in Phase 2)
- tools/geometry_utils.py   (NEW — pure-Python spatial helpers: haversine, centroid, corridor, cheapest_insertion)
- tools/order_tools.py      (list_orders, create_order, assign_orders_to_plan, assign_orders_to_route_group, update_order_state)
- tools/plan_tools.py       (list_plans, list_route_groups, create_plan, materialize_route_groups)
- tools/item_tools.py       (search_item_types, add_items_to_order)

Skeleton (NotImplemented - later phases):
- tools/order_tools.py      (update_order)
- tools/plan_execution/local_delivery_handler.py

Stub (returns not_implemented):
- tools/plan_execution/international_shipping_handler.py
- tools/plan_execution/store_pickup_handler.py

---

## Redis and Providers

Redis thread lifecycle, ownership constraints, and provider abstraction remain unchanged in this phase.

Provider files remain the same:
- providers/base.py
- providers/openai_provider.py
- providers/anthropic_provider.py
- providers/gemini_provider.py

---

## Guardrails

- No direct DB mutation from AI layer
- Tool execution only through whitelist registry
- Unknown tool raises ValueError
- State changes must be confirmed before mutation
- Never invent IDs or mutate on guesswork
- Keep response formatting deterministic

---

## Next Phases

### Phase 4 — Mutation Tools ✅ (complete)

### Phase 5 — Item Domain Tools ✅ (complete)

### Phase 6 — Deferred Mutations
- update_order (requires update_extensions orchestration)
- optimize_plan (strategy-specific planning work)

---

## Maintenance Rule (Repeated)

Every change in ai/ must update AI_OPERATOR.md in the same change set.
