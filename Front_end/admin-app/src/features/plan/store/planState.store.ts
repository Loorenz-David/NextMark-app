import type { EntityTable } from "@shared-store"
import type { DeliveryPlanState } from '@/features/plan/types/planState'

import { createEntityStore } from "@shared-store"
import { selectAll, selectByClientId, selectByServerId } from "@shared-store"
import { useShallow } from 'zustand/react/shallow'

export const PLAN_STATE_TRANSITIONS: Record<string, string[]> = {
  draft: ['active', 'cancelled'],
  active: ['completed', 'cancelled'],
  completed: [],
  cancelled: [],
}

export const useDeliveryPlanStateStore = createEntityStore<DeliveryPlanState>()

export const selectAllDeliveryPlanStates = (state: EntityTable<DeliveryPlanState>) => selectAll<DeliveryPlanState>()(state)

export const useDeliveryPlanState = ()=> useDeliveryPlanStateStore(useShallow(selectAllDeliveryPlanStates))

export const selectDeliveryPlanStateByClientId = (clientId: string | null | undefined) =>
  (state: EntityTable<DeliveryPlanState>) =>
    selectByClientId<DeliveryPlanState>(clientId)(state)

export const selectDeliveryPlanStateByServerId = (id: number | null | undefined) =>
  (state: EntityTable<DeliveryPlanState>) =>
    selectByServerId<DeliveryPlanState>(id)(state)

export const insertDeliveryPlanState = (DeliveryPlanState: DeliveryPlanState) =>
  useDeliveryPlanStateStore.getState().insert(DeliveryPlanState)

export const insertDeliveryPlanStates = (table: { byClientId: Record<string, DeliveryPlanState>; allIds: string[] }) =>
  useDeliveryPlanStateStore.getState().insertMany(table)

export const updateDeliveryPlanState = (clientId: string, updater: (DeliveryPlanState: DeliveryPlanState) => DeliveryPlanState) =>
  useDeliveryPlanStateStore.getState().update(clientId, updater)

export const removeDeliveryPlanState = (clientId: string) =>
  useDeliveryPlanStateStore.getState().remove(clientId)

export const clearDeliveryPlanStates = () =>
  useDeliveryPlanStateStore.getState().clear()
