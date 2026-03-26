import type { OrderUpdateResponse } from '@/features/order/types/order'
import { applyOrderRouteArtifacts } from '@/features/plan/bridges/orderRouteArtifacts.bridge'
import { selectRoutePlanByServerId, useRoutePlanStore } from '@/features/plan/store/routePlan.slice'

type OrderUpdateBundle = OrderUpdateResponse['updated'][number]

export const handlePlanOrderUpdate = (bundle: OrderUpdateBundle): void => {
  const deliveryPlanId = bundle?.order?.route_plan_id
  if (!deliveryPlanId) return

  const plan = selectRoutePlanByServerId(deliveryPlanId)(useRoutePlanStore.getState())
  if (!plan) return

  applyOrderRouteArtifacts(bundle)
}
