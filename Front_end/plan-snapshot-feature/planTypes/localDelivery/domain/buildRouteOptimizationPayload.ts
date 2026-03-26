import type { RouteOptimizationPayload } from '@/features/plan/planTypes/localDelivery/api/routeOptimization.api'
import type { LocalDeliveryPlan } from '@/features/plan/planTypes/localDelivery/types/localDeliveryPlan'
import type { RouteSolution } from '@/features/plan/planTypes/localDelivery/types/routeSolution'
import type { DeliveryPlan } from '@/features/plan/types/plan'

type Params = {
  plan: DeliveryPlan | null | undefined
  localDeliveryPlan: LocalDeliveryPlan | null | undefined
  selectedRouteSolution: RouteSolution | null
}

export function buildRouteOptimizationPayload({
  plan,
  localDeliveryPlan,
  selectedRouteSolution,
}: Params): RouteOptimizationPayload | null {
  const localDeliveryPlanId = localDeliveryPlan?.id
  if (!localDeliveryPlanId) return null
  void plan
  void selectedRouteSolution

  return {
    local_delivery_plan_id: localDeliveryPlanId,
  }
}
