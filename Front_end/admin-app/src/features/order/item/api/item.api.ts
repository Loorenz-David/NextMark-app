import { apiClient } from '@/lib/api/ApiClient'
import type { ApiResult } from '@/lib/api/types'

import type { Item, ItemMap, ItemQueryFilters, ItemUpdateFields } from '../types'

export type ItemListResponse = {
  items: ItemMap
}

export type ItemCreateResponse = {
  item: Record<string, number> & {
    ids_without_match?: number[]
  }
}

export type ItemUpdatePayload = {
  target_id: number | string
  fields: ItemUpdateFields
}

export type ItemDeletePayload = {
  target_id?: number | string
  target_ids?: Array<number | string>
}

export const getOrderItems = (
  orderId: number,
  query?: ItemQueryFilters,
): Promise<ApiResult<ItemListResponse>> =>
  apiClient.request<ItemListResponse>({
    path: `/orders/${orderId}/items/`,
    method: 'GET',
    query,
  })

export const createItem = (
  payload: Item | Item[],
): Promise<ApiResult<ItemCreateResponse>> =>
  apiClient.request<ItemCreateResponse>({
    path: '/items/',
    method: 'POST',
    data: { fields: payload },
  })

export const updateItem = (
  payload: ItemUpdatePayload | ItemUpdatePayload[],
): Promise<ApiResult<Record<string, never>>> =>
  apiClient.request<Record<string, never>>({
    path: '/items/',
    method: 'PATCH',
    data: { target: payload },
  })

export const deleteItem = (
  payload: ItemDeletePayload,
): Promise<ApiResult<Record<string, never>>> =>
  apiClient.request<Record<string, never>>({
    path: '/items/',
    method: 'DELETE',
    data: payload,
  })

export const useGetOrderItems = () => getOrderItems
export const useCreateItem = () => createItem
export const useUpdateItem = () => updateItem
export const useDeleteItem = () => deleteItem

export type { Item, ItemMap }
