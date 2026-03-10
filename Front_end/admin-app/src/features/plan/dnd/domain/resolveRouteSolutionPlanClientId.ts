import { selectPlanByServerId, usePlanStore } from '@/features/plan/store/plan.slice'
import {
  selectLocalDeliveryPlanByServerId,
  useLocalDeliveryPlanStore,
} from '@/features/plan/planTypes/localDelivery/store/localDelivery.slice'
import {
  selectRouteSolutionByServerId,
  useRouteSolutionStore,
} from '@/features/plan/planTypes/localDelivery/store/routeSolution.store'

export const resolveRouteSolutionPlanClientId = (routeSolutionId: number | null | undefined): string | null => {
  if (routeSolutionId == null) return null

  const routeSolution = selectRouteSolutionByServerId(routeSolutionId)(useRouteSolutionStore.getState())
  if (!routeSolution?.local_delivery_plan_id) return null

  const localDeliveryPlan = selectLocalDeliveryPlanByServerId(routeSolution.local_delivery_plan_id)(
    useLocalDeliveryPlanStore.getState(),
  )
  if (!localDeliveryPlan?.delivery_plan_id) return null

  const plan = selectPlanByServerId(localDeliveryPlan.delivery_plan_id)(usePlanStore.getState())
  return plan?.client_id ?? null
}
