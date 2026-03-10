import { apiClient } from '@/lib/api/ApiClient'
import type { ApiResult } from '@/lib/api/types'

import type { OrderStateMap } from '../types/orderState'

export type OrderStateListResponse = {
  order_states: OrderStateMap
}

export const getOrderStates = (): Promise<ApiResult<OrderStateListResponse>> =>
  apiClient.request<OrderStateListResponse>({
    path: '/orders/states/',
    method: 'GET',
  })

export const updateOrderState = (
  orderId: number,
  stateId: number,
): Promise<ApiResult<Record<string, never>>> =>
  apiClient.request<Record<string, never>>({
    path: `/orders/${orderId}/state/${stateId}`,
    method: 'PATCH',
  })

export const useGetOrderStates = () => getOrderStates
export const useUpdateOrderState = () => updateOrderState
