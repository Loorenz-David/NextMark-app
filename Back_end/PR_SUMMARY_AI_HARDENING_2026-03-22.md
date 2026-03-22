# PR Summary: AI Stability and Reliability Hardening

## Why
This PR hardens the AI operator stack for functional stability under real usage by closing six reliability gaps:
- analytics completeness over larger windows,
- safer statistics routing,
- deterministic timeframe fallback and context injection,
- structured-output resilience,
- structured insight/warning rendering,
- broader verification confidence.

## What Changed

### 1) Statistics and Analytics Reliability
- Added read-only statistics capability profile and prompts.
- Added deterministic analytics pagination across full timeframe windows.
- Added `data_status` completeness metadata and warning propagation.
- Added bounded one-shot repair for malformed statistical final payloads.
- Added structured validation details when repair cannot recover.

### 2) Routing and Guardrails
- Tightened statistics route hint patterns to avoid false-positive routing.
- Added confidence-aware fallback behavior and topic-aware routing context.
- Added write-guard enforcement for user-config mutation tools.

### 3) Interaction and Execution Facts
- Normalized interaction forms into execution facts.
- Enforced statistics timeframe fallback (`last_7_days` -> `7d`) when missing.
- Improved confirm/question interaction handling consistency.

### 4) Response Contract and Rendering
- Expanded AI message schema for blocks, interactions, typed warnings, intent, and rendering hints.
- Formatter now renders statistics insight/warning blocks and emits typed warnings.
- Frontend panel now fully maps and displays V2 payload contract fields.

### 5) Observability and Telemetry
- Added routing and statistics-specific logs (fallback, repair, completeness, validation count).
- Added request-scoped AI token usage aggregation hooks.

## Risk Assessment
- Risk level: Medium-Low.
- Main risk surfaces:
  - routing heuristic regressions,
  - edge behavior in malformed/partial statistics outputs,
  - stricter write guards affecting previously permissive flows.
- Mitigation:
  - targeted unit/integration coverage,
  - bounded repair path,
  - explicit structured error payloads.

## Backward Compatibility
- Legacy data path remains supported in formatter and frontend adapters.
- Public thread/message endpoint shape remains compatible, with additive fields for V2 clients.

## Validation Performed
- Live boot probe:
  - `PYTHONPATH=. python run.py` starts server on `0.0.0.0:5050`.
- Live HTTP smoke:
  - `GET /` returns `200` and `{ "status": "ok" }`.
  - unauthenticated `POST /api_v2/ai/threads` rejected (auth enforcement expected).
- AI integration smoke:
  - `tests/integration/ai/test_ai_thread_geocode_flow.py` passed.
- Targeted AI unit suites for routing, orchestrator, formatter, and statistics passed.

## Rollout Notes
- Recommend canary monitoring on:
  - statistics parse/repair failure rate,
  - snapshot completeness warnings frequency,
  - routing fallback frequency,
  - user-config write guard rejections.
