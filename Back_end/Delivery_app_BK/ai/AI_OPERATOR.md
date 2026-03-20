# AI Logistics Operator — Architecture Reference

> **Maintenance rule:** Update this file after every build, modification, or removal in the `ai/` module.
> This document is the source of truth for understanding, extending, and maintaining the AI operator.

---

## What This Is

The AI Logistics Operator is **not a chatbot**. It is a multi-step tool-calling agent:

```
User input → Planner (LLM) → selects tool → Backend executes → result back to LLM → repeat → final response
```

The LLM decides *what* to do. The backend decides *how* to do it safely. The AI never touches the database directly.

---

## Module Structure

```
Delivery_app_BK/ai/
  AI_OPERATOR.md          ← this file
  __init__.py

  orchestrator.py         ← entry point: handle_ai_request(ctx, user_input, provider)
  planner.py              ← LLM conversation loop: get_next_step(user_input, history, provider)
  tool_registry.py        ← whitelist: TOOLS dict mapping name → function
  tool_executor.py        ← dispatcher: execute_tool(ctx, tool_name, params)
  schemas.py              ← Pydantic contracts: AIResponse, ToolCall, PlannerStep, PlannerState

  prompts/
    system_prompt.py      ← PLANNER_SYSTEM_PROMPT: tool catalogue + domain rules for the LLM

  providers/
    base.py               ← LLMProvider Protocol: name, complete(system, user) → str
    openai_provider.py    ← ACTIVE: OpenAI gpt-4.1-mini
    anthropic_provider.py ← STUB: raises NotImplementedError
    gemini_provider.py    ← STUB: raises NotImplementedError

  tools/
    plan_tools.py         ← plan-domain tools (list, get, create, optimize)
    order_tools.py        ← order-domain tools (list, assign)
    messaging_tools.py    ← STUB: future messaging tools
```

---

## Request Flow

```
POST /api_v2/ai/command  { input: "...", parameters: {} }
         ↓
  routers/api_v2/ai.py   → ServiceContext(incoming_data=parameters, identity=get_jwt())
         ↓
  orchestrator.handle_ai_request(ctx, user_input, provider=OpenAIProvider())
         ↓
  [loop MAX_STEPS=5]
    planner.get_next_step(user_input, history, provider)
      → sends full conversation (system + user + all prior tool calls + results) to LLM
      → LLM returns { type: "tool", tool: "...", parameters: {...} }
                 OR { type: "final", message: "..." }
         ↓
    if "tool" → tool_executor.execute_tool(ctx, name, params)
                 → validates name in TOOLS whitelist
                 → calls tool_fn(ctx, **params)
                 → appends { tool, params, result } to history
    if "final" → return AIResponse(success, message, steps=history)
         ↓
  AIResponse.model_dump() → JSON response
```

**History lives only for the duration of one HTTP request.** It is not persisted.

---

## Registered Tools (current)

| Tool name | Function | Domain service it calls |
|---|---|---|
| `list_orders` | `order_tools.list_orders_tool` | `services/queries/order/list_orders.py` |
| `assign_orders_to_plan` | `order_tools.assign_orders_to_plan_tool` | `services/commands/order/update_order_delivery_plan.py` |
| `assign_orders` | alias → `assign_orders_to_plan_tool` | same |
| `list_plans` | `plan_tools.list_plans_tool` | `services/queries/plan/list_delivery_plans.py` → `find_plans.py` |
| `get_plan_summary` | `plan_tools.get_plan_summary_tool` | `services/queries/plan/get_plan.py` |
| `create_plan` | `plan_tools.create_plan_tool` | `services/commands/plan/create_plan.py` |
| `optimize_plan` | `plan_tools.optimize_plan_tool` | `route_optimization/orchestrator.py` |

---

## Tool Filter Architecture

### `list_orders` → `find_orders.py` (centralized query)

All order queries go through `services/queries/order/find_orders.py`.
Tools inject filters into `ctx.query_params` before calling the service.

**Available filters exposed to the AI:**

| Parameter | Type | Description |
|---|---|---|
| `plan_id` | integer | orders assigned to a specific plan |
| `q` | string | free-text search |
| `s` | list[string] | fields to search: `reference_number`, `order_scalar_id`, `external_source`, `tracking_number`, `client_email`, `client_address`, `client_name`, `client_phone`, `article_number`, `item_type`, `plan_label`, `plan_type` |
| `scheduled` | boolean | `true` = has plan, `false` = unassigned |
| `show_archived` | boolean | archived orders |
| `order_state_id` | int or list[int] | filter by state |
| `earliest_delivery_date` | ISO string | delivery window start |
| `latest_delivery_date` | ISO string | delivery window end |
| `creation_date_from` | ISO string | created on/after |
| `creation_date_to` | ISO string | created on/before |
| `limit` | integer | max results |
| `sort` | string | `date_asc` or `date_desc` |

**To add a new order filter:**
1. Add it to `find_orders.py` (the filter logic)
2. Add the param to `list_orders_tool()` in `order_tools.py`
3. Document it in `PLANNER_SYSTEM_PROMPT` under `list_orders`
4. Update this file

### `list_plans` → `find_plans.py` (centralized query)

All plan queries go through `services/queries/plan/find_plans.py`.
Tools inject filters into `ctx.query_params`.

**Available filters exposed to the AI:**

| Parameter | Type | Description |
|---|---|---|
| `label` | string | plan name prefix |
| `plan_type` | string | `local_delivery` / `international_shipping` / `store_pickup` |
| `plan_state_id` | integer | filter by state |
| `covers_start` + `covers_end` | ISO strings | **overlap filter** — finds plans whose window covers the target range. Condition: `plan.start_date <= covers_end AND plan.end_date >= covers_start` |
| `start_date` | ISO string | plans starting on/after (for browsing, not scheduling) |
| `end_date` | ISO string | plans ending on/before (for browsing, not scheduling) |
| `max_orders` | integer | plans with ≤ N orders (uses `DeliveryPlan.total_orders` column) |
| `min_orders` | integer | plans with ≥ N orders |
| `limit` | integer | max results |

**To add a new plan filter:**
1. Add it to `find_plans.py`
2. Add the param to `list_plans_tool()` in `plan_tools.py`
3. Document it in `PLANNER_SYSTEM_PROMPT` under `list_plans`
4. Update this file

---

## Domain Model — Scheduling

```
Order.delivery_plan_id  → NULL = unscheduled, set = scheduled
DeliveryPlan.start_date / end_date → activity window for the plan
DeliveryPlan.plan_type  → "local_delivery" | "international_shipping" | "store_pickup"
OrderDeliveryWindow     → time windows (start_at, end_at, window_type) evaluated at optimization
```

**Removed legacy fields (2026-03):** `earliest_delivery_date`, `latest_delivery_date`, `preferred_time_start`, `preferred_time_end` — these were computed caches of delivery windows and are no longer stored on the Order model.

**"Reschedule" = move an order to a different plan. Never set dates directly on the order.**

Scheduling flow:
1. `list_orders` with filters to get order IDs
2. `list_plans` with `covers_start` + `covers_end` + `plan_type` to find existing plans
3. If plan found → `assign_orders_to_plan`
4. If no plan → `create_plan` → `assign_orders_to_plan`

Plan type intent mapping (LLM uses language → maps to value):
- "route delivery", "driver dispatch", "last-mile" → `local_delivery` **(default)**
- "international", "overseas", "cross-border" → `international_shipping`
- "pickup", "store pickup", "collect at store" → `store_pickup`

---

## LLM Provider Pattern

Providers implement the `LLMProvider` Protocol (`providers/base.py`):
```python
class LLMProvider(Protocol):
    name: str
    def complete(self, system: str, user: str) -> str: ...
```

The `planner.py` uses `_complete_with_history()` for multi-turn conversations.
OpenAI is called with the full message array directly.
Other providers fall back to single-turn `complete()` (loses conversation state after step 1).

**To switch provider:** change one line in `orchestrator.py`:
```python
provider = provider or OpenAIProvider()   # swap to AnthropicProvider() or GeminiProvider()
```

**To wire Anthropic/Gemini:** implement `complete()` with multi-turn history support in the respective provider file.

---

## Guardrails (non-negotiable)

- **No direct DB access from AI layer.** Tools call domain services only.
- **Whitelist only.** Only functions registered in `TOOLS` (tool_registry.py) can be called. Unknown tool names raise `ValueError` — recorded in history, loop continues.
- **MAX_STEPS = 5.** Hard cap on tool calls per request. Prevents infinite loops.
- **No dynamic execution.** The LLM returns a tool name string; Python executes a pre-written function.
- **History is ephemeral.** No conversation memory between requests.

---

## API Contract

```
POST /api_v2/ai/command
Authorization: Bearer <jwt>   (ADMIN or ASSISTANT role required)

Body: {
  "input": "natural language request",
  "parameters": {}   // optional — passed as ctx.incoming_data
}

Response: {
  "success": true | false,
  "message": "human-readable summary",
  "data": { ... } | null,
  "steps": [
    { "tool": "list_orders", "params": {...}, "result": {...} },
    ...
  ]
}
```

---

## Adding a New Tool (checklist)

1. **Write the tool function** in the appropriate `tools/*.py` file:
   - Signature: `def my_tool(ctx: ServiceContext, param1, ...) -> dict`
   - Call only existing domain services — never the DB directly
   - Always return a `dict`
2. **Register it** in `tool_registry.py`: add `"my_tool": my_tool_fn` to `TOOLS`
3. **Document it** in `prompts/system_prompt.py` under `AVAILABLE TOOLS`
   - Include all parameters, types, descriptions, and when to use it
4. **Update this file** — add the tool to the Registered Tools table and any relevant filter tables
5. **No new one-off query files** — extend `find_orders.py` or `find_plans.py` instead

---

## Removing a Tool (checklist)

1. Remove the entry from `TOOLS` in `tool_registry.py`
2. Remove the function from `tools/*.py`
3. Remove it from `PLANNER_SYSTEM_PROMPT`
4. Update this file

---

## Environment Requirements

```
OPENAI_API_KEY=sk-...   # required in .env and .ebEnv
```
