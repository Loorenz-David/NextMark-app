import type {
  Order,
  OrderBatchMoveResponse,
  OrderBatchSelectionPayload,
  OrderBatchSelectionResolveResponse,
  OrderCreatePayload,
  OrderCreateResponse,
  OrderDeleteResponse,
  OrderMap,
  OrderPagination,
  OrderPlanUpdateResponse,
  OrderQueryFilters,
  OrderStats,
  OrderUpdateFields,
  OrderUpdateResponse,
  coordinates,
} from '@shared-domain'
import type { ApiResult } from '../core'
import type { QueryValue } from '../http'
import type { HttpApiClient } from '../http/createApiClient'

export type OrderListResponse = {
  order: OrderMap
  order_stats: OrderStats
  order_pagination: OrderPagination
}

export type OrderMapMarkerResponse = {
  markers: Array<{
    id: string
    coordinates: coordinates
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

export const createOrdersApi = (client: Pick<HttpApiClient, 'request'>) => ({
  listOrders: (query?: OrderQueryFilters): Promise<ApiResult<OrderListResponse>> =>
    client.request<OrderListResponse>({
      path: '/orders/',
      method: 'GET',
      query,
    }),

  getOrder: (orderId: number | string): Promise<ApiResult<OrderDetailResponse>> =>
    client.request<OrderDetailResponse>({
      path: `/orders/${orderId}`,
      method: 'GET',
    }),

  createOrder: (payload: OrderCreatePayload): Promise<ApiResult<OrderCreateResponse>> =>
    client.request<OrderCreateResponse>({
      path: '/orders/',
      method: 'PUT',
      data: { fields: payload },
    }),

  updateOrder: (
    payload: OrderUpdatePayload | OrderUpdatePayload[],
  ): Promise<ApiResult<OrderUpdateResponse>> =>
    client.request<OrderUpdateResponse>({
      path: '/orders/',
      method: 'PATCH',
      data: { target: payload },
    }),

  deleteOrder: (payload: OrderDeletePayload): Promise<ApiResult<OrderDeleteResponse>> =>
    client.request<OrderDeleteResponse>({
      path: '/orders/',
      method: 'DELETE',
      data: payload,
    }),

  archiveOrder: (payload: OrderDeletePayload): Promise<ApiResult<Record<string, never>>> =>
    client.request<Record<string, never>>({
      path: '/orders/archive',
      method: 'PATCH',
      data: payload,
    }),

  unarchiveOrder: (payload: OrderDeletePayload): Promise<ApiResult<Record<string, never>>> =>
    client.request<Record<string, never>>({
      path: '/orders/unarchive',
      method: 'PATCH',
      data: payload,
    }),

  updateOrderDeliveryPlan: (
    orderId: number | string,
    planId: number | string,
  ): Promise<ApiResult<OrderPlanUpdateResponse>> =>
    client.request<OrderPlanUpdateResponse>({
      path: `/orders/${orderId}/plan/${planId}`,
      method: 'PATCH',
    }),

  resolveOrderBatchSelection: (
    selection: OrderBatchSelectionPayload,
  ): Promise<ApiResult<OrderBatchSelectionResolveResponse>> =>
    client.request<OrderBatchSelectionResolveResponse>({
      path: '/orders/selection/resolve',
      method: 'POST',
      data: { selection },
    }),

  updateOrdersDeliveryPlanBatch: (
    planId: number | string,
    selection: OrderBatchSelectionPayload,
  ): Promise<ApiResult<OrderBatchMoveResponse>> =>
    client.request<OrderBatchMoveResponse>({
      path: `/orders/plan/${planId}/batch`,
      method: 'PATCH',
      data: { selection },
    }),

  listOrderMapMarkers: (
    query?: Record<string, QueryValue>,
  ): Promise<ApiResult<OrderMapMarkerResponse>> =>
    client.request<OrderMapMarkerResponse>({
      path: '/orders/map_markers/',
      method: 'GET',
      query,
    }),
})
