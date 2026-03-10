import type { PlanTypeKey } from '@/features/plan/types/plan'
import { buildLocalDeliveryPlanTypeDefaults } from '@/features/plan/planTypes/localDelivery/domain/planTypeDefaults/localDeliveryDefaults.generator'
import type { PlanTypeDefaultsGenerator, PlanTypeDefaultsResolver } from './planTypeDefaults.types'

const PLAN_TYPE_DEFAULTS_GENERATORS: Partial<Record<PlanTypeKey, PlanTypeDefaultsGenerator>> = {
  local_delivery: buildLocalDeliveryPlanTypeDefaults,
}

export const resolvePlanTypeDefaults: PlanTypeDefaultsResolver = async (planType, ctx) => {
  const generator = PLAN_TYPE_DEFAULTS_GENERATORS[planType]
  if (!generator) return undefined
  return generator(ctx)
}
