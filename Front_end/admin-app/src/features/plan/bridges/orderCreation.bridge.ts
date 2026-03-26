import type { OrderCreateBundle } from '@/features/order/types/order'
import { resolveOrderCreationHandler } from '@/features/plan/registry/planTypeOrderCreation.registry'
import { selectRoutePlanByServerId, useRoutePlanStore } from '@/features/plan/store/routePlan.slice'

export const handlePlanOrderCreation = (bundle: OrderCreateBundle): void => {
  const deliveryPlanId = bundle?.order?.delivery_plan_id
  if (!deliveryPlanId) return

  const plan = selectRoutePlanByServerId(deliveryPlanId)(useRoutePlanStore.getState())
  if (!plan?.plan_type) return

  const handler = resolveOrderCreationHandler(plan.plan_type)
  if (handler) {
    handler(bundle)
  }
}
