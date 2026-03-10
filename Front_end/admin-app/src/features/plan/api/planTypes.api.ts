import { apiClient } from '@/lib/api/ApiClient'
import type { ApiResult } from '@/lib/api/types'
import type { PlanTypeKey } from '@/features/plan/types/plan'
import type { InternationalShippingPlanMap } from '@/features/plan/types/internationalShippingPlan'
import type { LocalDeliveryPlanMap } from '@/features/plan/planTypes/localDelivery/types/localDeliveryPlan'
import type { StorePickupPlanMap } from '@/features/plan/types/storePickupPlan'

export type PlanTypeResponse = {
  delivery_plan_type: InternationalShippingPlanMap | LocalDeliveryPlanMap | StorePickupPlanMap
}

export const planTypesApi = {
  getPlanType: (planId: number | string, planType: PlanTypeKey): Promise<ApiResult<PlanTypeResponse>> =>
    apiClient.request<PlanTypeResponse>({
      path: `/plans/${planId}/type/${planType}`,
      method: 'GET',
    }),
}
