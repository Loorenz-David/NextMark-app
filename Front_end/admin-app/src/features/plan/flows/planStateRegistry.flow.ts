import { useMemo } from 'react'

import { useDeliveryPlanState } from '@/features/plan/store/planState.store'
import { createPlanStateRegistry } from '@/features/plan/domain/createPlanStateRegistry'

export const usePlanStateRegistryFlow = () => {
  const states = useDeliveryPlanState()

  return useMemo(() => createPlanStateRegistry(states), [states])
}
