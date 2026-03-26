import { apiClient } from '@/lib/api/ApiClient'
import type { ApiResult } from '@/lib/api/types'

import type { OrderMap } from '@/features/order/types/order'
import type { LocalDeliveryPlanMap } from '@/features/plan/planTypes/localDelivery/types/localDeliveryPlan'
import type { RouteSolutionMap } from '@/features/plan/planTypes/localDelivery/types/routeSolution'
import type { RouteSolutionStopMap } from '@/features/plan/planTypes/localDelivery/types/routeSolutionStop'

export type LocalDeliveryOverviewResponse = {
  order: OrderMap
  local_delivery_plan: LocalDeliveryPlanMap
  route_solution: RouteSolutionMap
  route_solution_stop: RouteSolutionStopMap
}

export const planOverviewApi = {
  getLocalDeliveryOverview: (
    planId: number | string,
  ): Promise<ApiResult<LocalDeliveryOverviewResponse>> =>
    apiClient.request<LocalDeliveryOverviewResponse>({
      path: `/plan_overviews/${planId}/local_delivery/`,
      method: 'GET',
    }),
}
