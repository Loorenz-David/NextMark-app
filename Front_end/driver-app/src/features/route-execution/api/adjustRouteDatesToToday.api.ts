import type { ApiResult } from '@shared-api'
import { driverApiClient } from '@/app/services/client'

type AdjustRouteDatesToTodayPayloadDto = {
  time_zone: string
}

type AdjustRouteDatesToTodayResponseDto = {
  adjusted?: boolean
}

export function adjustRouteDatesToTodayApi(
  routeId: number,
  data: AdjustRouteDatesToTodayPayloadDto,
): Promise<ApiResult<AdjustRouteDatesToTodayResponseDto>> {
  return driverApiClient.request<AdjustRouteDatesToTodayResponseDto>({
    path: `/drivers/routes/${routeId}/adjust-dates-to-today`,
    method: 'PATCH',
    data,
  })
}
