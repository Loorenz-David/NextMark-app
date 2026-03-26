import { usePlanStore, selectAllPlans, selectPlanByClientId, selectPlanByServerId, selectVisiblePlans, useDeliveryPlanStateById as useDeliveryPlanStateStoreById } from '@/features/plan/store/plan.slice'
import { useShallow } from 'zustand/react/shallow'
import { useMemo } from 'react'
import { useInternationalShippingPlanByPlanId } from '@/features/plan/planTypes/internationalShipping/hooks/useInternationalShippingPlan'
import { useLocalDeliveryPlanByPlanId } from '@/features/plan/planTypes/localDelivery/store/useLocalDeliveryPlan.selector'
import { useStorePickupPlanByPlanId } from '@/features/plan/planTypes/storePickup/hooks/useStorePickupPlan'
import { reactivePlanVisibility } from '@/features/plan/domain/planReactiveVisibility'
import { selectPlanListQuery, usePlanListStore } from './planList.store'

export const usePlans = () => usePlanStore(useShallow(selectAllPlans))
export const useVisiblePlans = () => {
  const plans = usePlanStore(useShallow(selectVisiblePlans))
  const query = usePlanListStore(selectPlanListQuery)

  return useMemo(
    () => plans.filter((plan) => reactivePlanVisibility(plan, query)),
    [plans, query],
  )
}

export const usePlanByClientId = (clientId: string | null | undefined) =>
  usePlanStore(selectPlanByClientId(clientId))

export const usePlanByServerId = (id: number | null | undefined) =>
  usePlanStore(selectPlanByServerId(id))

export const useDeliveryPlanStateById = (stateId: number | null | undefined) =>
  useDeliveryPlanStateStoreById(stateId)



export const usePlanType = (clientId: string | null | undefined) => {
  const plan = usePlanByClientId(clientId)

  const local = useLocalDeliveryPlanByPlanId(plan?.id)
  const international = useInternationalShippingPlanByPlanId(plan?.id)
  const pickup = useStorePickupPlanByPlanId(plan?.id)

  if (!plan) return null

  switch (plan.plan_type) {
    case 'local_delivery':
      return local
    case 'international_shipping':
      return international
    case 'store_pickup':
      return pickup
    default:
      return null
  }
}
