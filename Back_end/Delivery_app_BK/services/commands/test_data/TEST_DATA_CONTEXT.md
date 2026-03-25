# Test Data Context

## Purpose
This folder contains the test-data generation pipeline used to seed realistic data for:
- Item property and item type catalogs (frontend fast-fill options)
- Delivery plans
- Orders linked to those plans

The system is designed to be configurable, repeatable, and safe for environments that already contain non-test data.

Additionally, all created rows now receive a `client_id` automatically (when the model has a `client_id` column) via the shared instance-creation utility.

## High-Level Flow
Main orchestrator entry point:
- `generate_plan_and_order_test_data` in `orchestrator.py`

Execution order:
1. Generate item properties and item types
2. Generate plans
3. Update route solution settings for each local delivery plan
4. Generate orders linked to those plans

This order ensures orders can generate random items using available item types.

## Folder Structure
- `orchestrator.py`: Runs item types -> plans -> orders.
- `item_types_data_creators.py`: Creates item properties and item types, then links them.
- `plan_data_creators.py`: Creates local delivery, store pickup, and international shipping plans.
- `order_data_creators.py`: Creates orders, links them to plans, generates random items, and assigns delivery windows.
- `item_generator.py`: Builds random order items based on available item types and property definitions.
- `config/plan_defaults.py`: Default plan payloads and test labels used for filtering.
- `config/order_defaults.py`: Default order templates by plan type.
- `config/item_types_defaults.py`: Default item properties and item types.
- `config/item_generation_defaults.py`: Quantity, weight, and dimension ranges by item type.
- `config/route_solution_update_defaults.py`: Default route solution settings (shift times, depot address, service times, ETA tolerance).
- `route_solution_settings_updater.py`: Applies default (or overridden) settings to all route solutions created in step 3.
- `cleanup.py`: Removes test-data rows for a team (orders/plans/item types/item properties) using test markers.

## Data Isolation Strategy
To avoid mixing with production-like records:
- Plan loading is filtered by known test labels (`TEST_PLAN_LABELS`).
- Order references include `test-` prefix.
- Item type and property names include `test-` prefix.

## Default Parameters
This section explains the default runtime behavior when no overrides are provided.

### Item Types and Properties
Source:
- `config/item_types_defaults.py`

Defaults:
- 10 item properties
- 5 item types
- Each item type linked to at least 2 properties

Override keys in incoming payload:
- `item_properties`: list of additional property objects
- `item_types`: list of additional type objects

### Plans
Source:
- `config/plan_defaults.py`

Defaults:
- 3 local_delivery plans
- 1 store_pickup plan
- 1 international_shipping plan
- Labels are pre-defined and used later for filtering

Override keys:
- `plan_data.plans` (nested)
- `plans` (top-level compatibility key)

### Orders
Source:
- `config/order_defaults.py`

Defaults:
- Local-delivery defaults create 10-20 orders per local-delivery plan
- Store-pickup defaults use 5 order templates
- International-shipping defaults use 5 order templates
- Plan types: `local_delivery`, `store_pickup`, `international_shipping`
- Local-delivery orders are generated per plan; store-pickup and international-shipping use round-robin matching

Override keys:
- `order_data.orders_by_plan_type` (nested)
- `orders_by_plan_type` (top-level compatibility key)

### Route Solution Settings
Source:
- `route_solution_settings_updater.py` + `config/route_solution_update_defaults.py`

Default behavior:
- Applied automatically to all route solutions belonging to `local_delivery` plans
- Driver is set to the current user (`ctx.user_id`); overrideable with `driver_id`
- Shift window: `09:00` – `16:00`
- Depot start location: Sibeliusgången 2A, 164 73 Kista, Stockholm
- Service time per order: 3 minutes (stored as seconds in `stops_service_time.time`)
- Service time per item: 1 minute (stored as seconds in `stops_service_time.per_item`)
- ETA tolerance: 30 minutes (stored as seconds in `eta_tolerance_seconds`)

Payload key:
- `route_solution_settings_data`

Overrideable fields inside `route_solution_settings_data`:
```json
{
  "driver_id": null,
  "set_start_time": "09:00",
  "set_end_time": "16:00",
  "start_location": {
    "city": "Stockholms län",
    "coordinates": { "lat": 59.41324450245052, "lng": 17.92244581469024 },
    "country": "Sweden",
    "postal_code": "164 73",
    "street_address": "Sibeliusgången 2A, 164 73 Kista, Sweden"
  },
  "service_time_per_order_minutes": 3,
  "service_time_per_item_minutes": 1,
  "eta_tolerance_minutes": 30
}
```

### Random Items per Order
Source:
- `order_data_creators.py` + `item_generator.py` + `config/item_generation_defaults.py`

Default behavior:
- Random item generation enabled
- Min items per order: 1
- Max items per order: 10
- Quantity, weight, and dimensions are generated with item-type-aware ranges

Payload key:
- `order_item_generation`

Default `order_item_generation` values:
```json
{
  "enabled": true,
  "min_items": 1,
  "max_items": 10,
  "ranges_map": null
}
```

### Delivery Windows per Order
Source:
- `order_data_creators.py`

Default behavior:
- Delivery-window generation enabled
- For each plan, 2 orders receive delivery windows
- Single-date plans: multiple windows on the same date, different times
- Date-range plans: multiple windows distributed across dates inside plan range

Payload key:
- `order_delivery_window_generation`

Default `order_delivery_window_generation` values:
```json
{
  "enabled": true,
  "orders_with_windows_per_plan": 2,
  "single_date_min_windows": 2,
  "single_date_max_windows": 3,
  "range_date_min_windows": 2,
  "range_date_max_windows": 4
}
```

## Full Payload Example
```json
{
  "item_types_data": {
    "item_properties": [],
    "item_types": []
  },
  "plan_data": {
    "plans": []
  },
  "order_data": {
    "orders_by_plan_type": {
      "local_delivery": [],
      "store_pickup": [],
      "international_shipping": []
    }
  },
  "order_item_generation": {
    "enabled": true,
    "min_items": 1,
    "max_items": 10,
    "ranges_map": null
  },
  "route_solution_settings_data": {
    "driver_id": null,
    "set_start_time": "09:00",
    "set_end_time": "16:00",
    "start_location": {
      "city": "Stockholms län",
      "coordinates": { "lat": 59.41324450245052, "lng": 17.92244581469024 },
      "country": "Sweden",
      "postal_code": "164 73",
      "street_address": "Sibeliusgången 2A, 164 73 Kista, Sweden"
    },
    "service_time_per_order_minutes": 3,
    "service_time_per_item_minutes": 1,
    "eta_tolerance_minutes": 30
  },
  "order_delivery_window_generation": {
    "enabled": true,
    "orders_with_windows_per_plan": 2,
    "single_date_min_windows": 2,
    "single_date_max_windows": 3,
    "range_date_min_windows": 2,
    "range_date_max_windows": 4
  }
}
```

## Cleanup API (Seed Router)
Route:
- `POST /api_v2/seed/test-data/cleanup`
- `DELETE /api_v2/seed/test-data` (REST-style alias)

Required body fields:
- `key`
- `team_id`

Optional body fields:
- identity claims: `user_id`, `active_team_id`, `role_id`, `base_role_id`, `time_zone`, `default_country_code`
- cleanup knobs:
  - `order_reference_prefix` (default: `test-`)
  - `item_name_prefix` (default: `test-`)
  - `additional_plan_labels` (list of extra labels to treat as test plans)

Cleanup behavior:
- Deletes team orders matching either:
  - orders linked to known test plan labels
  - order references starting with configured prefix (`test-` by default)
- Deletes matched delivery plans (cascades to local/store/international plan rows, route solutions, route stops, and plan events)
- Deletes team item types and item properties whose names start with configured prefix (`test-` by default)
- Idempotent: calling the cleanup route multiple times is safe.

## Notes for Developers
- Keep defaults in `config/` modules.
- Keep parser validation in creator modules close to runtime use.
- When adding new knobs, update this file and unit tests in `tests/unit/services/commands/test_data/`.
- Prefer additive, backward-compatible payload keys where possible.
