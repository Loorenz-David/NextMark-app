import type { ApiResult } from '@shared-api'
import { driverApiClient } from '@/app/services/client'
import type { FailOrderResponseDto } from './routeActions.dto'

export function failOrderApi(
  orderId: number,
  description: string,
  orderCaseClientId: string,
  caseChatClientId: string,
): Promise<ApiResult<FailOrderResponseDto>> {
  return driverApiClient.request<FailOrderResponseDto>({
    path: `/drivers/orders/${orderId}/fail`,
    method: 'POST',
    data: {
      description,
      order_case: {
        client_id: orderCaseClientId,
      },
      case_chat: {
        client_id: caseChatClientId,
      },
    },
  })
}
