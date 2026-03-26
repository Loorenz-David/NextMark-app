# Refactor Remaining Phases — Codex Implementation Plan

**Date:** 2026-03-26
**Working directory for all paths:** `Front_end/admin-app/src/`
**Shared package path:** `Front_end/packages/`

This document covers exactly what still needs to be done. Phases 1 and 2 are already complete.
Follow each section in order. Do not skip ahead.

---

## Overview of Remaining Work

| Phase | Description | Files touched |
|---|---|---|
| A | Fix API response type keys in `plan.api.ts` and all callers | 5 files |
| B | Fix API URL paths in 6 API files | 6 files |
| C | Fix realtime package data field | 1 file |
| D | Delete dead `planTypeSelector` component | 1 folder + 1 export |
| E | Folder promotion: `planTypes/localDelivery` → `routeGroup` | Many files (mechanical) |

---

## Phase A — Fix API Response Type Keys

The backend renamed the JSON response keys for plan-related endpoints. The types and callers in the frontend still use the old key names.

### A1 — File: `features/plan/api/plan.api.ts`

**Change the three response type definitions** at the top of the file.

Replace:
```typescript
export type PlanListResponse = {
  delivery_plan: DeliveryPlanMap
  delivery_plan_stats: PlanStats
  delivery_plan_pagination: PlanPagination
}

export type PlanDetailResponse = {
  delivery_plan: DeliveryPlanMap | DeliveryPlan
}

export type DeliveryPlanStateListResponse = {
  plan_states: DeliveryPlanStateMap
  plan_states_pagination: DeliveryPlanStatePagination
}
```

With:
```typescript
export type PlanListResponse = {
  route_plan: DeliveryPlanMap
  route_plan_stats: PlanStats
  route_plan_pagination: PlanPagination
}

export type PlanDetailResponse = {
  route_plan: DeliveryPlanMap | DeliveryPlan
}

export type DeliveryPlanStateListResponse = {
  route_plan_states: DeliveryPlanStateMap
  route_plan_states_pagination: DeliveryPlanStatePagination
}
```

---

### A2 — File: `features/plan/flows/planQueries.flow.ts`

This file reads the response from `planApi.listPlans` and `planApi.getPlan`. Update both usages.

**Change 1** — inside `fetchPlansPage`, replace:
```typescript
        if (!payload?.delivery_plan) {
          console.warn('Plan list response missing delivery_plan', payload)
          setRoutePlanListError('Missing delivery plans response.')
          return null
        }

        insertRoutePlans(payload.delivery_plan)
```
With:
```typescript
        if (!payload?.route_plan) {
          console.warn('Plan list response missing route_plan', payload)
          setRoutePlanListError('Missing route plans response.')
          return null
        }

        insertRoutePlans(payload.route_plan)
```

**Change 2** — inside `fetchPlanById`, replace:
```typescript
        const normalized = normalizeEntityMap<DeliveryPlan>(payload?.delivery_plan as DeliveryPlanMap | DeliveryPlan)
        if (!normalized) {
          console.warn('Plan response missing delivery_plan', payload)
```
With:
```typescript
        const normalized = normalizeEntityMap<DeliveryPlan>(payload?.route_plan as DeliveryPlanMap | DeliveryPlan)
        if (!normalized) {
          console.warn('Plan response missing route_plan', payload)
```

---

### A3 — File: `features/plan/flows/planState.flow.ts`

Replace:
```typescript
        if (!payload?.plan_states) {
          console.warn('Plan states response missing plan_states', payload)
          return null
        }

        insertRoutePlanStates(payload.plan_states)
```
With:
```typescript
        if (!payload?.route_plan_states) {
          console.warn('Plan states response missing route_plan_states', payload)
          return null
        }

        insertRoutePlanStates(payload.route_plan_states)
```

---

### A4 — File: `features/plan/hooks/usePlanPaginationController.ts`

This file reads `delivery_plan`, `delivery_plan_stats`, and `delivery_plan_pagination` from the response object returned by `fetchPlansPage`.

**Change 1** — replace:
```typescript
    if (!response?.delivery_plan) {
      useRoutePlanPaginationStore.getState().setLoadingPage(false)
      setRoutePlanListError('Missing delivery plans response.')
      return null
    }

    if (append) {
      appendVisibleRoutePlans(response.delivery_plan.allIds)
    } else {
      setVisibleRoutePlans(response.delivery_plan.allIds)
    }

    setRoutePlanListResult({
      queryKey,
      query: {
        ...query,
        limit: 25,
      },
      stats: response.delivery_plan_stats,
      pagination: response.delivery_plan_pagination,
    })

    useRoutePlanPaginationStore.getState().applyPageResult({
      queryKey,
      nextCursor: response.delivery_plan_pagination?.next_cursor ?? null,
      hasMore: response.delivery_plan_pagination?.has_more ?? false,
      append,
    })
```
With:
```typescript
    if (!response?.route_plan) {
      useRoutePlanPaginationStore.getState().setLoadingPage(false)
      setRoutePlanListError('Missing route plans response.')
      return null
    }

    if (append) {
      appendVisibleRoutePlans(response.route_plan.allIds)
    } else {
      setVisibleRoutePlans(response.route_plan.allIds)
    }

    setRoutePlanListResult({
      queryKey,
      query: {
        ...query,
        limit: 25,
      },
      stats: response.route_plan_stats,
      pagination: response.route_plan_pagination,
    })

    useRoutePlanPaginationStore.getState().applyPageResult({
      queryKey,
      nextCursor: response.route_plan_pagination?.next_cursor ?? null,
      hasMore: response.route_plan_pagination?.has_more ?? false,
      append,
    })
```

---

### A5 — File: `features/bootstrap/bootstrp.api.ts`

> Note: the filename has a typo (`bootstrp` not `bootstrap`) — do not rename it.

Replace:
```typescript
  plan_states: DeliveryPlanStateMap
```
With:
```typescript
  route_plan_states: DeliveryPlanStateMap
```

---

### A6 — File: `features/bootstrap/bootstrap.hook.ts`

Replace:
```typescript
        if (payload.plan_states) {
          insertRoutePlanStates(payload.plan_states)
        }
```
With:
```typescript
        if (payload.route_plan_states) {
          insertRoutePlanStates(payload.route_plan_states)
        }
```

---

## Phase B — Fix API URL Paths

Six API files still have old backend URL paths. Edit each one.

### B1 — File: `features/plan/api/plan.api.ts`

Make these 5 path replacements (all are string literals inside `apiClient.request` calls):

| Old | New |
|---|---|
| `'/plans/'` | `'/route_plans/'` |
| `` `/plans/${planId}` `` | `` `/route_plans/${planId}` `` |
| `` `/plans/${planId}/orders/` `` | `` `/route_plans/${planId}/orders/` `` |
| `'/plans/states/'` | `'/route_plans/states/'` |
| `` `/plans/${planId}/state/${stateId}` `` | `` `/route_plans/${planId}/state/${stateId}` `` |

After edits the full `planApi` object should look like:
```typescript
export const planApi = {
  listPlans: (query?: PlanQueryFilters): Promise<ApiResult<PlanListResponse>> =>
    apiClient.request<PlanListResponse>({
      path: '/route_plans/',
      method: 'GET',
      query,
    }),

  getPlan: (planId: number | string): Promise<ApiResult<PlanDetailResponse>> =>
    apiClient.request<PlanDetailResponse>({
      path: `/route_plans/${planId}`,
      method: 'GET',
    }),

  getPlanOrders: (planId: number | string, query?: any): Promise<ApiResult<OrderListResponse>> =>
    apiClient.request<OrderListResponse>({
      path: `/route_plans/${planId}/orders/`,
      method: 'GET',
      query,
    }),

  createPlan: (payload: PlanCreatePayload | PlanCreatePayload[]): Promise<ApiResult<PlanCreateResponse>> =>
    apiClient.request<PlanCreateResponse>({
      path: '/route_plans/',
      method: 'POST',
      data: { fields: payload },
    }),

  updatePlan: (payload: PlanUpdatePayload | PlanUpdatePayload[]): Promise<ApiResult<Record<string, never>>> =>
    apiClient.request<Record<string, never>>({
      path: '/route_plans/',
      method: 'PATCH',
      data: { target: payload },
    }),

  deletePlan: (payload: PlanDeletePayload): Promise<ApiResult<Record<string, never>>> =>
    apiClient.request<Record<string, never>>({
      path: '/route_plans/',
      method: 'DELETE',
      data: payload,
    }),

  listDeliveryPlanStates: (query?: DeliveryPlanStateQueryFilters): Promise<ApiResult<DeliveryPlanStateListResponse>> =>
    apiClient.request<DeliveryPlanStateListResponse>({
      path: '/route_plans/states/',
      method: 'GET',
      query,
    }),

  updateDeliveryPlanState: (planId: number | string, stateId: number | string): Promise<ApiResult<Record<string, never>>> =>
    apiClient.request<Record<string, never>>({
      path: `/route_plans/${planId}/state/${stateId}`,
      method: 'PATCH',
    }),
}
```

---

### B2 — File: `features/plan/planTypes/localDelivery/api/planOverview.api.ts`

**Step 1** — Update the response type. Replace:
```typescript
export type LocalDeliveryOverviewResponse = {
  order: OrderMap
  local_delivery_plan: LocalDeliveryPlanMap
  route_solution: RouteSolutionMap
  route_solution_stop: RouteSolutionStopMap
}
```
With:
```typescript
export type LocalDeliveryOverviewResponse = {
  order: OrderMap
  route_group: LocalDeliveryPlanMap
  route_solution: RouteSolutionMap
  route_solution_stop: RouteSolutionStopMap
}
```

**Step 2** — Update the URL path. Replace:
```typescript
      path: `/plan_overviews/${planId}/local_delivery/`,
```
With:
```typescript
      path: `/route_plan_overviews/${planId}/route_group/`,
```

---

### B3 — File: `features/plan/planTypes/localDelivery/flows/localDeliveryOverview.flow.ts`

This is the caller that reads `payload.local_delivery_plan` from the response type changed in B2.

Replace:
```typescript
  if (payload.local_delivery_plan) {
    upsertLocalDeliveryPlans(payload.local_delivery_plan)
  }
```
With:
```typescript
  if (payload.route_group) {
    upsertLocalDeliveryPlans(payload.route_group)
  }
```

---

### B4 — File: `features/plan/planTypes/localDelivery/api/localDeliveryPlanSettings.api.ts`

Replace:
```typescript
      path: '/plans/local_delivery',
```
With:
```typescript
      path: '/route_groups/settings',
```

---

### B5 — File: `features/plan/planTypes/localDelivery/api/routeSolution.api.ts`

Only one path in this file uses the old `/plans/` prefix. The others (`/route_solutions/...`) are already correct — do not touch them.

Replace:
```typescript
      path: `/plans/${deliveryPlanId}/plan-is-ready`,
```
With:
```typescript
      path: `/route_plans/${deliveryPlanId}/route-is-ready`,
```

---

### B6 — File: `features/local-delivery-orders/api/planOverview.api.ts`

This is the mirror of B2 inside the `local-delivery-orders` feature. Apply identical changes.

**Step 1** — Update the response type. Replace:
```typescript
export type LocalDeliveryOverviewResponse = {
  order: OrderMap
  local_delivery_plan: LocalDeliveryPlanMap
  route_solution: RouteSolutionMap
  route_solution_stop: RouteSolutionStopMap
}
```
With:
```typescript
export type LocalDeliveryOverviewResponse = {
  order: OrderMap
  route_group: LocalDeliveryPlanMap
  route_solution: RouteSolutionMap
  route_solution_stop: RouteSolutionStopMap
}
```

**Step 2** — Update the URL path. Replace:
```typescript
      path: `/plan_overviews/${planId}/local_delivery/`,
```
With:
```typescript
      path: `/route_plan_overviews/${planId}/route_group/`,
```

---

### B7 — File: `features/local-delivery-orders/flows/localDeliveryOverview.flow.ts`

Mirror of B3 for the `local-delivery-orders` feature. Replace:
```typescript
  if (payload.local_delivery_plan) {
    upsertLocalDeliveryPlans(payload.local_delivery_plan)
  }
```
With:
```typescript
  if (payload.route_group) {
    upsertLocalDeliveryPlans(payload.route_group)
  }
```

---

### B8 — File: `features/local-delivery-orders/api/localDeliveryPlanSettings.api.ts`

Mirror of B4. Replace:
```typescript
      path: '/plans/local_delivery',
```
With:
```typescript
      path: '/route_groups/settings',
```

---

### B9 — File: `features/local-delivery-orders/api/routeSolution.api.ts`

Check if this file has a `plan-is-ready` path. If it does, apply the same change as B5:
```
/plans/${deliveryPlanId}/plan-is-ready  →  /route_plans/${deliveryPlanId}/route-is-ready
```
Do not touch any other paths in this file.

---

## Phase C — Fix Realtime Package Data Field

### C1 — File: `packages/shared-realtime/src/contracts/events.ts` — line 207

This file has one data field name that was renamed. Find the `NotificationItem` type and replace:
```typescript
  route_group_id?: number
```
With:
```typescript
  route_group_id?: number
```

> **IMPORTANT — Do NOT change these in the same file:**
> - The string `'local_delivery_plan.updated'` in `BusinessEventName`, `ADMIN_BUSINESS_EVENT_NAMES`, and `DRIVER_BUSINESS_EVENT_NAMES` — these are WebSocket event names sent by the backend server. Do not rename them until the backend confirms the new event name.
> - The string `'local_delivery_plan'` in `BusinessEntityType` and `BUSINESS_ENTITY_TYPES` — same reason.
>
> Only the `route_group_id` **property field** on `NotificationItem` should be changed.

---

## Phase D — Delete Dead `planTypeSelector` Component

The plan type selector dropdown is dead code. There is only one plan type now. Nothing outside its own folder imports it anymore — the exports in `plan/components/index.ts` are the only external references, and those are re-exports to nowhere.

### D1 — Delete the folder

Delete the entire folder:
```
features/plan/components/planTypeSelector/
```

It contains these files (all delete):
- `PlanTypeSelector.tsx`
- `PlanTypeSelector.types.ts`
- `PlanTypeOptionCard.tsx` (likely exists)
- `PlanTypeOptionList.tsx`
- `planTypeOptions.ts`
- `intex.ts` (note: typo in the filename — delete it)

### D2 — Remove the exports from `features/plan/components/index.ts`

Open `features/plan/components/index.ts` and remove these three lines:
```typescript
export { PlanTypeSelector } from './planTypeSelector/PlanTypeSelector'
export { PlanTypeOptionCard } from './planTypeSelector/PlanTypeOptionCard'
export { PlanTypeOptionList } from './planTypeSelector/PlanTypeOptionList'
```

Do not remove any other exports from this file.

---

## Phase E — Folder Promotion: `planTypes/localDelivery` → `routeGroup`

This is a mechanical find-and-replace of import paths. No logic changes — only file locations change.

### E1 — Move the folder

Move:
```
features/plan/planTypes/localDelivery/
```
To:
```
features/plan/routeGroup/
```

After the move, delete the now-empty `planTypes/` folder:
```
features/plan/planTypes/    ← delete this (will be empty after move)
```

### E2 — Update all import paths

Every file that imports from `@/features/plan/planTypes/localDelivery/` must be updated to `@/features/plan/routeGroup/`.

Run this command from the `admin-app/src/` directory:

```bash
find . -type f \( -name "*.ts" -o -name "*.tsx" \) \
  -exec sed -i '' \
    's|@/features/plan/planTypes/localDelivery/|@/features/plan/routeGroup/|g' {} +
```

After running, verify no references remain:
```bash
grep -r "planTypes/localDelivery" . --include="*.ts" --include="*.tsx"
```

If any results appear, fix them manually.

### E3 — Fix internal relative imports inside `routeGroup/`

After the move some files inside `routeGroup/` may have relative imports pointing to `../` paths that still say `planTypes`. Run the same verification inside just the moved folder:

```bash
grep -r "planTypes" features/plan/routeGroup/ --include="*.ts" --include="*.tsx"
```

Fix any relative import that still contains `planTypes/localDelivery` manually.

---

## Verification — Run These After All Phases

After completing all phases above, run each check and confirm zero results:

```bash
# 1. No old plan API paths remain
grep -r "'/plans/\|/plans/local_delivery\|/plan_overviews\|plan-is-ready" src/ --include="*.ts" --include="*.tsx"

# 2. No old response key reads remain
grep -r "payload\.delivery_plan\b\|payload\.plan_states\b\|payload\.local_delivery_plan\b\|response\.delivery_plan_stats\|response\.delivery_plan_pagination" src/ --include="*.ts" --include="*.tsx"

# 3. planTypes folder is gone
ls src/features/plan/planTypes/ 2>/dev/null && echo "STILL EXISTS - fix needed" || echo "OK"

# 4. planTypeSelector is gone
ls src/features/plan/components/planTypeSelector/ 2>/dev/null && echo "STILL EXISTS - fix needed" || echo "OK"

# 5. No old realtime data field
grep -r "route_group_id" ../packages/ --include="*.ts"

# 6. TypeScript compiles clean
cd .. && pnpm tsc --noEmit
```

All checks should be clean before the work is considered done.

---

## What You Must NOT Change

These look similar to the things being renamed but must stay exactly as they are:

| Pattern | Reason |
|---|---|
| `Order.route_plan_id` field | FK from Order to route plan |
| `local_delivery_plan.updated` event name strings | Backend WebSocket event names — verify with backend before touching |
| `'local_delivery_plan'` in `BusinessEntityType` | Same — backend socket contract |
| Any path under `/route_solutions/...` in `routeSolution.api.ts` | Already correct, do not touch |
| Any path under `/route_solutions/optimize` in `routeOptimization.api.ts` | Already correct |
| `local-delivery-orders/` feature's internal store and component names | Internal naming is stable, only API paths and response keys change |
