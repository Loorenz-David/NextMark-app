import { useShallow } from 'zustand/react/shallow'

import { useOrdersByPlanId } from '@/features/order/store/orderHooks.store'
import { usePlanByServerId } from '@/features/plan/store/usePlan.selector'
import { useLocalDeliveryPlanByPlanId } from '@/features/plan/planTypes/localDelivery/store/useLocalDeliveryPlan.selector'
import {
  useRouteSolutionsByLocalDeliveryPlanId,
  useSelectedRouteSolutionByLocalDeliveryPlanId,
} from '@/features/plan/planTypes/localDelivery/store/useRouteSolution.selector'
import {
  selectRouteSolutionStopsBySolutionId,
  useRouteSolutionStopStore,
} from '@/features/plan/planTypes/localDelivery/store/routeSolutionStop.store'

export const useLocalDeliveryResourcesFlow = (planId: number) => {
  const plan = usePlanByServerId(planId)
  const localDeliveryPlan = useLocalDeliveryPlanByPlanId(planId)
  const orders = useOrdersByPlanId(planId)
  const localDeliveryPlanId = localDeliveryPlan?.id ?? null
  const routeSolutions = useRouteSolutionsByLocalDeliveryPlanId(localDeliveryPlanId)
  const selectedRouteSolution = useSelectedRouteSolutionByLocalDeliveryPlanId(localDeliveryPlanId)
  const routeSolutionId = selectedRouteSolution?.id ?? null
  const routeSolutionStops = useRouteSolutionStopStore(
    useShallow(selectRouteSolutionStopsBySolutionId(routeSolutionId)),
  )
  const planStartDate = plan?.start_date ?? null

  return {
    plan,
    planStartDate,
    localDeliveryPlan,
    orders,
    localDeliveryPlanId,
    routeSolutions,
    selectedRouteSolution,
    routeSolutionId,
    routeSolutionStops,
  }
}
