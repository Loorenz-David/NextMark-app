# Admin AI Feature — Developer Context

Feature path: `admin-app/src/features/ai/`
Last updated: 2026-03-22

---

## What this feature is

Admin integration layer between backend thread APIs and `@nextmark/ai-panel`.
It owns:

- raw API calls
- DTO normalization
- provider wiring for panel transport + action resolution
- admin-specific structured block rendering
- order-row UI actions from AI blocks (open detail)

---

## Layer map

```
AdminAiPanelProvider
  ├─ adminAiPanelTransport (domain/adminAiPanelAdapter.ts)
  │    ├─ createThread -> POST /ai/threads
  │    ├─ sendMessage  -> POST /ai/threads/:id/messages
  │    └─ loadThread   -> GET  /ai/threads/:id
  ├─ resolveAction (navigate/open_settings/apply_order_filters/copy_text)
  └─ renderBlock -> AdminAiBlockRenderer
        ├─ useAiOrderRowClick.controller
        │    └─ resolveAiOrderDetailPayload
        └─ renderAdminAiBlock (pure renderer)
             ├─ AiOrderCard
             └─ AiOrdersTable
```

---

## Backend protocol summary

Endpoints (via `ai.api.ts`):

| Operation | Method | Path |
|---|---|---|
| Create thread | POST | `/ai/threads` |
| Send message | POST | `/ai/threads/:id/messages` |
| Reload thread | GET | `/ai/threads/:id` |

Transport maps these into the package `AiTransportAdapter` contract.

---

## Normalization responsibilities

`domain/adminAiPanelAdapter.ts` is the only backend->panel normalization boundary.

Key mappings:

- `normalizeV2Response` -> `AiPanelResponse`
- `normalizeV2Block` -> `AiMessageBlock`
- `normalizeV2Action` -> `AiActionDescriptor`
- `normalizeV2ToolTrace` -> `AiToolTraceEntry`
- interaction field/option normalization

No UI component should consume raw DTO types from `types/ai.ts` directly.

---

## Action resolution in provider

`providers/AdminAiPanelProvider.tsx` handles standard action types:

- `navigate`
- `open_settings`
- `apply_order_filters`
- `copy_text`

`apply_order_filters` uses `normalizeApplyOrderFiltersPayload` so search text and filters are separated cleanly before store updates.

Internal interaction actions (`interaction:*`) are still handled by the package hook and do not pass through provider `resolveAction`.

---

## Order row click behavior from AI blocks

Current behavior:

1. AI order blocks render via `AdminAiBlockRenderer`.
2. Wrapper hook `useAiOrderRowClick` injects an `onOrderRowClick` callback into the pure renderer.
3. `renderAdminAiBlock` forwards callback into `AiOrdersTable` rows and `AiOrderCard` cards.
4. Click/keyboard open `order.details` through section manager.
5. Identifier resolution:

- prefer `client_id`
- fallback to numeric `id`
- no-op when neither exists

This keeps side effects in controller layer and UI components presentational.

---

## Capability context passthrough

`@nextmark/ai-panel` now sends capability context fields per message:

- `context.capability_mode`
- `context.capability_id` (manual mode)

This feature transport already forwards `context` to backend unchanged.

---

## File reference

| File | Responsibility |
|---|---|
| `providers/AdminAiPanelProvider.tsx` | Feature entrypoint; mounts panel with transport, resolver, block renderer |
| `components/AdminAiBlockRenderer.tsx` | Hook-safe wrapper that injects row-click action callback |
| `components/renderAdminAiBlock.tsx` | Pure AI block renderer for order entity blocks |
| `components/AiOrderCard.tsx` | Presentational order card with optional click/keyboard interaction |
| `components/AiOrdersTable.tsx` | Presentational order table with optional row click/keyboard interaction |
| `controllers/useAiOrderRowClick.controller.ts` | Side-effect controller for opening order detail section |
| `domain/resolveAiOrderDetailPayload.ts` | Pure resolver for clientId/serverId payload extraction |
| `domain/adminAiPanelAdapter.ts` | DTO normalization + transport adapter implementation |
| `domain/normalizeApplyOrderFiltersPayload.ts` | apply_order_filters payload normalization |
| `api/ai.api.ts` | Raw HTTP calls |
| `types/ai.ts` | Raw backend DTO contracts |
