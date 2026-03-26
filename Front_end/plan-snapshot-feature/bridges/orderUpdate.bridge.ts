import type { OrderUpdateResponse } from '@/features/order/types/order'
import { resolveOrderUpdateHandler } from '@/features/plan/registry/planTypeOrderUpdate.registry'
import { selectPlanByServerId, usePlanStore } from '@/features/plan/store/plan.slice'

type OrderUpdateBundle = OrderUpdateResponse['updated'][number]

export const handlePlanOrderUpdate = (bundle: OrderUpdateBundle): void => {
  const deliveryPlanId = bundle?.order?.delivery_plan_id
  if (!deliveryPlanId) return

  const plan = selectPlanByServerId(deliveryPlanId)(usePlanStore.getState())
  if (!plan?.plan_type) return

  const handler = resolveOrderUpdateHandler(plan.plan_type)
  if (handler) {
    handler(bundle)
  }
}
