# AI Hardening Changelog

Date: 2026-03-22
Scope: AI orchestration, statistics reliability, routing safety, response contract, observability.

## Added
- Statistics capability with staged prompts and read-only analytics tool surface.
- Deterministic analytics window pagination service with completeness metadata (`data_status`).
- Structured statistics output contract parsing and validation via `StatisticalOutput`.
- One-shot statistical output repair path when initial model output is invalid.
- Structured insights/warnings rendering for statistical output in response formatter.
- Typed warning payload support in assistant messages (`typed_warnings`).
- Topic-scoped thread replay helpers and topic session metadata support.
- Proposal lifecycle tooling for item taxonomy config with idempotency and status transitions.
- Route stop query/list support and additional logistics read tools.
- AI token telemetry helpers for request-level usage aggregation.

## Changed
- AI routing now uses tighter capability hints and confidence-aware fallback behavior.
- AI router now tags turns with topic IDs and supports topic-scoped context packing.
- Execution facts injection now normalizes interaction forms and enforces statistics timeframe fallback.
- `list_orders` tool handling now prevents tiny limits from degrading broad list responses.
- Tool execution now enforces user-config write guards outside allowed capability contexts.
- Delivery window domain validation now uses explicit error codes for past time, overlap, and max windows.
- Frontend AI panel now supports richer V2 payload fields (intent, narrative policy, rendering hints, blocks, interactions).
- Frontend AI panel transcript now supports load-older windows and diagnostics metrics emission.

## Fixed
- Statistics routing no longer triggers on bare troubleshooting "why" messages without analytics context.
- Analytics snapshots no longer silently truncate at first page for larger windows.
- Statistics execution enforces fallback timeframe when clarify response omits explicit timeframe.
- Structured statistics payload failures now return explicit validation details instead of opaque failures.
- Formatter now preserves and surfaces statistical insights/warnings to the UI.
- Clarify/interaction state handling improved for confirm vs question behavior.

## Observability
- Added logs for:
  - statistics fallback usage and normalized timeframe,
  - statistical output repair success/failure,
  - statistical validation error counts,
  - analytics snapshot completeness and warning counts,
  - capability routing decision metadata.

## Verification
- Live startup smoke: backend booted locally on `http://0.0.0.0:5050`.
- HTTP smoke:
  - `GET /` -> `200` with `{ "status": "ok" }`.
  - `POST /api_v2/ai/threads` unauthenticated -> auth rejection as expected.
- AI integration smoke:
  - `tests/integration/ai/test_ai_thread_geocode_flow.py` passed.

## Known Follow-up (Non-blocking)
- Eventlet deprecation warning appears at startup; migration planning recommended.
