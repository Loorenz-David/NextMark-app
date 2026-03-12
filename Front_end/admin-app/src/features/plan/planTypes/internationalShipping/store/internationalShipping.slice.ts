import type { EntityTable } from "@shared-store"
import type { InternationalShippingPlan } from '@/features/plan/types/internationalShippingPlan'

import { createEntityStore } from "@shared-store"
import { selectAll, selectByClientId, selectByServerId } from "@shared-store"

export const useInternationalShippingPlanStore = createEntityStore<InternationalShippingPlan>()

export const selectAllInternationalShippingPlans = (state: EntityTable<InternationalShippingPlan>) =>
  selectAll<InternationalShippingPlan>()(state)

export const selectInternationalShippingPlanByClientId = (clientId: string | null | undefined) =>
  (state: EntityTable<InternationalShippingPlan>) =>
    selectByClientId<InternationalShippingPlan>(clientId)(state)

export const selectInternationalShippingPlanByServerId = (id: number | null | undefined) =>
  (state: EntityTable<InternationalShippingPlan>) =>
    selectByServerId<InternationalShippingPlan>(id)(state)

export const selectInternationalShippingPlanByPlanId = (planId: number | null | undefined) =>
  (state: EntityTable<InternationalShippingPlan>) => {
    if (planId == null) return null
    return state.allIds
      .map((clientId) => state.byClientId[clientId])
      .find((plan) => plan.delivery_plan_id === planId) ?? null
  }

export const insertInternationalShippingPlan = (plan: InternationalShippingPlan) =>
  useInternationalShippingPlanStore.getState().insert(plan)

export const insertInternationalShippingPlans = (
  table: { byClientId: Record<string, InternationalShippingPlan>; allIds: string[] },
) => useInternationalShippingPlanStore.getState().insertMany(table)

export const upsertInternationalShippingPlan = (plan: InternationalShippingPlan) => {
  const state = useInternationalShippingPlanStore.getState()
  if (state.byClientId[plan.client_id]) {
    state.update(plan.client_id, (existing) => ({ ...existing, ...plan }))
    return
  }
  state.insert(plan)
}

export const upsertInternationalShippingPlans = (
  table: { byClientId: Record<string, InternationalShippingPlan>; allIds: string[] },
) => {
  table.allIds.forEach((clientId) => {
    const plan = table.byClientId[clientId]
    if (plan) {
      upsertInternationalShippingPlan(plan)
    }
  })
}

export const updateInternationalShippingPlan = (
  clientId: string,
  updater: (plan: InternationalShippingPlan) => InternationalShippingPlan,
) => useInternationalShippingPlanStore.getState().update(clientId, updater)

export const removeInternationalShippingPlan = (clientId: string) =>
  useInternationalShippingPlanStore.getState().remove(clientId)

export const clearInternationalShippingPlans = () =>
  useInternationalShippingPlanStore.getState().clear()
