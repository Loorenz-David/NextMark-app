import type { OrderCreateBundle } from '@/features/order/types/order'
import { resolveOrderCreationHandler } from '@/features/plan/registry/planTypeOrderCreation.registry'
import { selectPlanByServerId, usePlanStore } from '@/features/plan/store/plan.slice'

export const handlePlanOrderCreation = (bundle: OrderCreateBundle): void => {
  const deliveryPlanId = bundle?.order?.delivery_plan_id
  if (!deliveryPlanId) return

  const plan = selectPlanByServerId(deliveryPlanId)(usePlanStore.getState())
  if (!plan?.plan_type) return

  const handler = resolveOrderCreationHandler(plan.plan_type)
  if (handler) {
    handler(bundle)
  }
}

