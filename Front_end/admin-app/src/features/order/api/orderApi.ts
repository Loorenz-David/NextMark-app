import { apiClient } from '@/lib/api/ApiClient'
import type { ApiResult } from '@/lib/api/types'
import type { QueryValue } from '@/lib/api/types'

import type {
  Order,
  OrderCreatePayload,
  OrderCreateResponse,
  OrderDeleteResponse,
  OrderMap,
  OrderPlanUpdateResponse,
  OrderUpdateResponse,
  OrderUpdateFields,
} from '../types/order'
import type { OrderPagination, OrderQueryFilters, OrderStats } from '../types/orderMeta'
import type { OrderBatchMoveResponse as BatchMoveResponse, OrderBatchSelectionPayload as BatchSelectionPayload, OrderBatchSelectionResolveResponse as BatchSelectionResolveResponse } from '../types/orderBatchSelection'

export type OrderListResponse = {
  order: OrderMap
  order_stats: OrderStats
  order_pagination: OrderPagination
}

export type OrderMapMarkerResponse = {
  markers: Array<{
    id: string
    coordinates: {
      lat: number
      lng: number
    }
    primary_order_client_id: string
    order_client_ids: string[]
    count: number
  }>
  order: OrderMap
  truncated: boolean
}

export type OrderDetailResponse = {
  order: OrderMap | Order
}

export type OrderUpdatePayload = {
  target_id: number | string
  fields: OrderUpdateFields
}

export type OrderDeletePayload = {
  target_id?: number | string
  target_ids?: Array<number | string>
}

export const listOrders = (query?: OrderQueryFilters): Promise<ApiResult<OrderListResponse>> =>
  apiClient.request<OrderListResponse>({
    path: '/orders/',
    method: 'GET',
    query,
  })

export const getOrder = (orderId: number | string): Promise<ApiResult<OrderDetailResponse>> =>
  apiClient.request<OrderDetailResponse>({
    path: `/orders/${orderId}`,
    method: 'GET',
  })

export const createOrder = (
  payload: OrderCreatePayload,
): Promise<ApiResult<OrderCreateResponse>> =>
  apiClient.request<OrderCreateResponse>({
    path: '/orders/',
    method: 'PUT',
    // Backend accepts `fields` as object or list for atomic batch create.
    data: { fields: payload },
  })

export const updateOrder = (
  payload: OrderUpdatePayload | OrderUpdatePayload[],
): Promise<ApiResult<OrderUpdateResponse>> =>
  apiClient.request<OrderUpdateResponse>({
    path: '/orders/',
    method: 'PATCH',
    data: { target: payload },
  })

export const deleteOrder = (
  payload: OrderDeletePayload,
): Promise<ApiResult<OrderDeleteResponse>> =>
  apiClient.request<OrderDeleteResponse>({
    path: '/orders/',
    method: 'DELETE',
    data: payload,
  })
export const archiveOrder = (
  payload: OrderDeletePayload,
): Promise<ApiResult<Record<string, never>>> =>
  apiClient.request<Record<string, never>>({
    path: '/orders/archive',
    method: 'PATCH',
    data: payload,
  })

export const unarchiveOrder = (
  payload: OrderDeletePayload,
): Promise<ApiResult<Record<string, never>>> =>
  apiClient.request<Record<string, never>>({
    path: '/orders/unarchive',
    method: 'PATCH',
    data: payload,
  })

export const updateOrderDeliveryPlan = (
  orderId: number | string,
  planId: number | string,
): Promise<ApiResult<OrderPlanUpdateResponse>> =>
  apiClient.request<OrderPlanUpdateResponse>({
    path: `/orders/${orderId}/plan/${planId}`,
    method: 'PATCH',
  })

export const resolveOrderBatchSelection = (
  selection: BatchSelectionPayload,
): Promise<ApiResult<BatchSelectionResolveResponse>> =>
  apiClient.request<BatchSelectionResolveResponse>({
    path: '/orders/selection/resolve',
    method: 'POST',
    data: { selection },
  })

export const updateOrdersDeliveryPlanBatch = (
  planId: number | string,
  selection: BatchSelectionPayload,
): Promise<ApiResult<BatchMoveResponse>> =>
  apiClient.request<BatchMoveResponse>({
    path: `/orders/plan/${planId}/batch`,
    method: 'PATCH',
    data: { selection },
  })

export const listOrderMapMarkers = (
  query?: Record<string, QueryValue>,
): Promise<ApiResult<OrderMapMarkerResponse>> =>
  apiClient.request<OrderMapMarkerResponse>({
    path: '/orders/map_markers/',
    method: 'GET',
    query,
  })

export const useGetOrders = () => listOrders
export const useGetOrder = () => getOrder
export const useCreateOrder = () => createOrder
export const useUpdateOrder = () => updateOrder
export const useDeleteOrder = () => deleteOrder
export const useUpdateOrderDeliveryPlan = () => updateOrderDeliveryPlan
export const useResolveOrderBatchSelection = () => resolveOrderBatchSelection
export const useUpdateOrdersDeliveryPlanBatch = () => updateOrdersDeliveryPlanBatch
export const useArchiveOrder = ()=> archiveOrder
export const useUnarchiveOrder = () => unarchiveOrder
export const useListOrderMapMarkers = () => listOrderMapMarkers
