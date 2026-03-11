import type { ApiResult } from '@shared-api'
import type { AssignedRouteViewModel, DriverCommandEnvelope, DriverRouteActionCommand, DriverRouteActionResult } from '../contracts/routeExecution.types'
import { driverApiClient } from './client'

export type AssignedRouteResponse = {
  route: AssignedRouteViewModel | null
}

export const routeExecutionApi = {
  getAssignedRoute: (): Promise<ApiResult<AssignedRouteResponse>> =>
    driverApiClient.request<AssignedRouteResponse>({
      path: '/drivers/routes/active',
      method: 'GET',
    }),

  executeRouteAction: (
    envelope: DriverCommandEnvelope<DriverRouteActionCommand>,
  ): Promise<ApiResult<DriverRouteActionResult>> =>
    driverApiClient.request<DriverRouteActionResult>({
      path: '/drivers/routes/actions',
      method: 'POST',
      data: envelope,
    }),
}
