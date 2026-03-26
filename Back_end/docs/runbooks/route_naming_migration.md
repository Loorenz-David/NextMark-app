# Route Naming Migration Runbook

## Objective
Move application naming from legacy `delivery_plan` / `local_delivery_plan` to canonical `route_plan` / `route_group` while keeping runtime stable.

## Current State
- Database tables are already canonical (`route_plan`, `route_group`).
- Compatibility aliases and wrappers are still used in service, router, socket, payload, and test layers.

## Removal Gates
All gates must pass before removing backward-compatibility wrappers.

1. Import Path Gate
- Canonical imports adopted in application code.
- Legacy module paths retained only as temporary shims.

2. Test Gate
- No tests monkeypatch legacy symbol names.
- Unit + integration suites pass with canonical symbols.

3. Contract Gate
- Event payloads include canonical IDs (`route_plan_id`, `route_group_id`).
- Legacy keys remain only if external consumers still require them.

4. Event Naming Gate
- Canonical event labels and entity types available and consumed.
- Legacy event names are either removed or fully mapped.

5. Legacy Scan Gate
- Legacy naming scan reports no runtime-critical legacy references outside approved shims.

## Legacy Scan Command
Run from repo root:

```bash
PYTHONPATH="$PWD" .venv/bin/python scripts/report_route_naming_legacy_refs.py
```

## Cleanup Order
1. Services and requests imports
2. Routers and handlers
3. Sockets/event contracts and emitters
4. Payload key aliases
5. Model aliases and shim modules

## Notes
- Do not remove wrappers ad hoc.
- Remove wrappers in bounded batches and run tests after each batch.
