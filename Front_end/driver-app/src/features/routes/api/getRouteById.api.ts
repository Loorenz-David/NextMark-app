import type { ApiResult } from '@shared-api'
import { driverApiClient } from '@/app/services/client'
import type { RouteSnapshotDto } from './routes.dto'

export function getRouteByIdApi(routeId: number): Promise<ApiResult<RouteSnapshotDto>> {
  return driverApiClient.request<RouteSnapshotDto>({
    path: `/drivers/routes/${routeId}`,
    method: 'GET',
  })
}
