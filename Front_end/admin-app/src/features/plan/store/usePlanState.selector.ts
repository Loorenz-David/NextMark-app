import { useShallow } from 'zustand/react/shallow'

import {
  selectAllDeliveryPlanStates,
  selectDeliveryPlanStateByClientId,
  selectDeliveryPlanStateByServerId,
  useDeliveryPlanStateStore,
} from '@/features/plan/store/planState.store'

export const useDeliveryPlanStates = () =>
  useDeliveryPlanStateStore(useShallow(selectAllDeliveryPlanStates))

export const useDeliveryPlanStateByClientId = (clientId: string | null | undefined) =>
  useDeliveryPlanStateStore(selectDeliveryPlanStateByClientId(clientId))

export const useDeliveryPlanStateByServerId = (id: number | null | undefined) =>
  useDeliveryPlanStateStore(selectDeliveryPlanStateByServerId(id))
