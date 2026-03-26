import {
  useRoutePlanStore,
  selectAllRoutePlans,
  selectRoutePlanByClientId,
  selectRoutePlanByServerId,
  selectVisibleRoutePlans,
  useRoutePlanStateById as useRoutePlanStateStoreById,
} from '@/features/plan/store/routePlan.slice'
import { useShallow } from 'zustand/react/shallow'
import { useMemo } from 'react'
import { useInternationalShippingPlanByPlanId } from '@/features/plan/planTypes/internationalShipping/hooks/useInternationalShippingPlan'
import { useLocalDeliveryPlanByPlanId } from '@/features/plan/planTypes/localDelivery/store/useLocalDeliveryPlan.selector'
import { useStorePickupPlanByPlanId } from '@/features/plan/planTypes/storePickup/hooks/useStorePickupPlan'
import { reactivePlanVisibility } from '@/features/plan/domain/planReactiveVisibility'
import { selectRoutePlanListQuery, useRoutePlanListStore } from './routePlanList.store'

export const useRoutePlans = () => useRoutePlanStore(useShallow(selectAllRoutePlans))
export const useVisibleRoutePlans = () => {
  const routePlans = useRoutePlanStore(useShallow(selectVisibleRoutePlans))
  const query = useRoutePlanListStore(selectRoutePlanListQuery)

  return useMemo(
    () => routePlans.filter((routePlan) => reactivePlanVisibility(routePlan, query)),
    [routePlans, query],
  )
}

export const useRoutePlanByClientId = (clientId: string | null | undefined) =>
  useRoutePlanStore(selectRoutePlanByClientId(clientId))

export const useRoutePlanByServerId = (id: number | null | undefined) =>
  useRoutePlanStore(selectRoutePlanByServerId(id))

export const useRoutePlanStateById = (stateId: number | null | undefined) =>
  useRoutePlanStateStoreById(stateId)



export const useRoutePlanType = (clientId: string | null | undefined) => {
  const routePlan = useRoutePlanByClientId(clientId)

  const local = useLocalDeliveryPlanByPlanId(routePlan?.id)
  const international = useInternationalShippingPlanByPlanId(routePlan?.id)
  const pickup = useStorePickupPlanByPlanId(routePlan?.id)

  if (!routePlan) return null

  switch (routePlan.plan_type) {
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
