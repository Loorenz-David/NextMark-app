import type { ComponentType } from 'react'

import type { PlanTypeKey } from '@/features/plan/types/plan'
import { PlanSectionTypesMap } from '@/features/plan/utils/planSectionTypeMap'

export const useSelectedPlanOrders = (
  planType: PlanTypeKey | null | undefined,
): ComponentType<any> | null => {
  if (!planType) return null
  return PlanSectionTypesMap[planType]
}
