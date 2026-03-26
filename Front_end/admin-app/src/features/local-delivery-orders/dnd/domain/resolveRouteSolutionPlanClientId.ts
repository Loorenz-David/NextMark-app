import { selectRoutePlanByServerId, useRoutePlanStore } from '@/features/plan/store/routePlan.slice'
import {
  selectLocalDeliveryPlanByServerId,
  useLocalDeliveryPlanStore,
} from '@/features/local-delivery-orders/store/localDelivery.slice'
import {
  selectRouteSolutionByServerId,
  useRouteSolutionStore,
} from '@/features/local-delivery-orders/store/routeSolution.store'

export const resolveRouteSolutionPlanClientId = (routeSolutionId: number | null | undefined): string | null => {
  if (routeSolutionId == null) return null

  const routeSolution = selectRouteSolutionByServerId(routeSolutionId)(useRouteSolutionStore.getState())
  if (!routeSolution?.local_delivery_plan_id) return null

  const localDeliveryPlan = selectLocalDeliveryPlanByServerId(routeSolution.local_delivery_plan_id)(
    useLocalDeliveryPlanStore.getState(),
  )
  if (!localDeliveryPlan?.delivery_plan_id) return null

  const plan = selectRoutePlanByServerId(localDeliveryPlan.delivery_plan_id)(useRoutePlanStore.getState())
  return plan?.client_id ?? null
}
