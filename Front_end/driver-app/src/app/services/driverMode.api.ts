import type { ApiResult } from '@shared-api'
import type { ModeSwitchCommand, ModeSwitchResponse } from '../contracts/driverSession.types'
import { driverApiClient } from './client'

export const driverModeApi = {
  switchMode: (payload: ModeSwitchCommand): Promise<ApiResult<ModeSwitchResponse>> =>
    driverApiClient.request<ModeSwitchResponse>({
      path: '/drivers/context/switch',
      method: 'POST',
      data: payload,
    }),
}
