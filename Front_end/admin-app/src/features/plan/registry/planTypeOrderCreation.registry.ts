import type { OrderCreateBundle } from '@/features/order/types/order'
import { applyOrderRouteArtifacts } from '@/features/plan/bridges/orderRouteArtifacts.bridge'
import type { PlanTypeKey } from '@/features/plan/types/plan'

export type PlanOrderCreationHandler = (bundle: OrderCreateBundle) => void

const localDeliveryOrderCreationHandler: PlanOrderCreationHandler = (bundle) => {
  applyOrderRouteArtifacts(bundle)
}

const HANDLERS: Partial<Record<PlanTypeKey, PlanOrderCreationHandler>> = {
  local_delivery: localDeliveryOrderCreationHandler,
}

export const resolveOrderCreationHandler = (
  planType: PlanTypeKey,
): PlanOrderCreationHandler | null => HANDLERS[planType] ?? null
