import type { EntityTable } from '@/shared/store/StoreFactory'
import type { RouteSolution } from '@/features/plan/planTypes/localDelivery/types/routeSolution'

import { createEntityStore } from '@/shared/store/StoreFactory'
import { selectAll, selectByClientId, selectByServerId } from '@/shared/store/entitySelectors'
import {
  selectLocalDeliveryPlanByServerId,
  useLocalDeliveryPlanStore,
} from '@/features/plan/planTypes/localDelivery/store/localDelivery.slice'
import { selectPlanByServerId, usePlanStore } from '@/features/plan/store/plan.slice'

export const useRouteSolutionStore = createEntityStore<RouteSolution>()

export const selectAllRouteSolutions = (state: EntityTable<RouteSolution>) =>
  selectAll<RouteSolution>()(state)

export const selectRouteSolutionByClientId = (clientId: string | null | undefined) =>
  (state: EntityTable<RouteSolution>) =>
    selectByClientId<RouteSolution>(clientId)(state)

export const selectRouteSolutionByServerId = (id: number | null | undefined) =>
  (state: EntityTable<RouteSolution>) =>
    selectByServerId<RouteSolution>(id)(state)

export const selectRouteSolutionsByLocalDeliveryPlanId = (
  localDeliveryPlanId: number | null | undefined,
) =>
  (state: EntityTable<RouteSolution>) => {
    if (localDeliveryPlanId == null) return []
    return state.allIds.reduce<RouteSolution[]>((acc, clientId) => {
      const solution = state.byClientId[clientId]
      if (solution?.local_delivery_plan_id === localDeliveryPlanId) {
        acc.push(solution)
      }
      return acc
    }, [])
  }

export const selectSelectedRouteSolutionByLocalDeliveryPlanId = (
  localDeliveryPlanId: number | null | undefined,
) =>
  (state: EntityTable<RouteSolution>) => {
    if (localDeliveryPlanId == null) return null
    return state.allIds
      .map((clientId) => state.byClientId[clientId])
      .find(
        (solution) => solution.local_delivery_plan_id === localDeliveryPlanId && solution.is_selected,
      ) ?? null
  }

export const getPlanEndDateByRouteSolutionId = (routeSolutionId?: number | null) => {
  if (routeSolutionId == null) return null
  const solution = selectRouteSolutionByServerId(routeSolutionId)(useRouteSolutionStore.getState())
  if (!solution?.local_delivery_plan_id) return null
  const localPlan = selectLocalDeliveryPlanByServerId(solution.local_delivery_plan_id)(
    useLocalDeliveryPlanStore.getState(),
  )
  if (!localPlan?.delivery_plan_id) return null
  const plan = selectPlanByServerId(localPlan.delivery_plan_id)(usePlanStore.getState())
  return plan?.end_date ?? null
}

export const insertRouteSolution = (solution: RouteSolution) =>
  useRouteSolutionStore.getState().insert(solution)

export const insertRouteSolutions = (table: { byClientId: Record<string, RouteSolution>; allIds: string[] }) =>
  useRouteSolutionStore.getState().insertMany(table)

export const upsertRouteSolution = (solution: RouteSolution) => {
  const state = useRouteSolutionStore.getState()
  if (state.byClientId[solution.client_id]) {
    state.update(solution.client_id, (existing) => ({ ...existing, ...solution }))
    return
  }
  state.insert(solution)
}

export const upsertRouteSolutions = (table: { byClientId: Record<string, RouteSolution>; allIds: string[] }) => {
  table.allIds.forEach((clientId) => {
    const solution = table.byClientId[clientId]
    if (solution) {
      upsertRouteSolution(solution)
    }
  })
}

export const updateRouteSolution = (
  clientId: string,
  updater: (solution: RouteSolution) => RouteSolution,
) => useRouteSolutionStore.getState().update(clientId, updater)

export const setSelectedRouteSolution = (selectedId: number, localDeliveryPlanId: number | null | undefined) => {
  const state = useRouteSolutionStore.getState()
  state.allIds.forEach((clientId) => {
    const solution = state.byClientId[clientId]
    if (!solution) return
    if (localDeliveryPlanId != null && solution.local_delivery_plan_id !== localDeliveryPlanId) return
    const isSelected = solution.id === selectedId
    if (solution.is_selected !== isSelected) {
      state.update(clientId, (existing) => ({
        ...existing,
        is_selected: isSelected,
      }))
    }
  })
}

export const removeRouteSolution = (clientId: string) =>
  useRouteSolutionStore.getState().remove(clientId)

export const clearRouteSolutions = () =>
  useRouteSolutionStore.getState().clear()

export const getRouteSolutionSnapshot = () => {
  const state = useRouteSolutionStore.getState()
  return structuredClone({
    byClientId: state.byClientId,
    idIndex: state.idIndex,
    allIds: state.allIds,
    visibleIds: state.visibleIds,
  })
}

export const restoreRouteSolutionSnapshot = (
  snapshot: {
    byClientId: Record<string, RouteSolution>
    idIndex: Record<number, string>
    allIds: string[]
    visibleIds: string[] | null
  },
) => useRouteSolutionStore.setState(snapshot)
