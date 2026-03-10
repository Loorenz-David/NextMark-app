import type { OrderUpdateResponse } from '@/features/order/types/order'
import { applyOrderRouteArtifacts } from '@/features/plan/bridges/orderRouteArtifacts.bridge'
import type { PlanTypeKey } from '@/features/plan/types/plan'

type OrderUpdateBundle = OrderUpdateResponse['updated'][number]
export type PlanOrderUpdateHandler = (bundle: OrderUpdateBundle) => void

const localDeliveryOrderUpdateHandler: PlanOrderUpdateHandler = (bundle) => {
  applyOrderRouteArtifacts(bundle)
}

const HANDLERS: Partial<Record<PlanTypeKey, PlanOrderUpdateHandler>> = {
  local_delivery: localDeliveryOrderUpdateHandler,
}

export const resolveOrderUpdateHandler = (
  planType: PlanTypeKey,
): PlanOrderUpdateHandler | null => HANDLERS[planType] ?? null
