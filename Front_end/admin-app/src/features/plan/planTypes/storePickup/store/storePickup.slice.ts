import type { EntityTable } from "@shared-store"
import type { StorePickupPlan } from '@/features/plan/types/storePickupPlan'

import { createEntityStore } from "@shared-store"
import { selectAll, selectByClientId, selectByServerId } from "@shared-store"

export const useStorePickupPlanStore = createEntityStore<StorePickupPlan>()

export const selectAllStorePickupPlans = (state: EntityTable<StorePickupPlan>) =>
  selectAll<StorePickupPlan>()(state)

export const selectStorePickupPlanByClientId = (clientId: string | null | undefined) =>
  (state: EntityTable<StorePickupPlan>) =>
    selectByClientId<StorePickupPlan>(clientId)(state)

export const selectStorePickupPlanByServerId = (id: number | null | undefined) =>
  (state: EntityTable<StorePickupPlan>) =>
    selectByServerId<StorePickupPlan>(id)(state)

export const selectStorePickupPlanByPlanId = (planId: number | null | undefined) =>
  (state: EntityTable<StorePickupPlan>) => {
    if (planId == null) return null
    return state.allIds
      .map((clientId) => state.byClientId[clientId])
      .find((plan) => plan.delivery_plan_id === planId) ?? null
  }

export const insertStorePickupPlan = (plan: StorePickupPlan) =>
  useStorePickupPlanStore.getState().insert(plan)

export const insertStorePickupPlans = (table: { byClientId: Record<string, StorePickupPlan>; allIds: string[] }) =>
  useStorePickupPlanStore.getState().insertMany(table)

export const upsertStorePickupPlan = (plan: StorePickupPlan) => {
  const state = useStorePickupPlanStore.getState()
  if (state.byClientId[plan.client_id]) {
    state.update(plan.client_id, (existing) => ({ ...existing, ...plan }))
    return
  }
  state.insert(plan)
}

export const upsertStorePickupPlans = (table: { byClientId: Record<string, StorePickupPlan>; allIds: string[] }) => {
  table.allIds.forEach((clientId) => {
    const plan = table.byClientId[clientId]
    if (plan) {
      upsertStorePickupPlan(plan)
    }
  })
}

export const updateStorePickupPlan = (clientId: string, updater: (plan: StorePickupPlan) => StorePickupPlan) =>
  useStorePickupPlanStore.getState().update(clientId, updater)

export const removeStorePickupPlan = (clientId: string) =>
  useStorePickupPlanStore.getState().remove(clientId)

export const clearStorePickupPlans = () =>
  useStorePickupPlanStore.getState().clear()
