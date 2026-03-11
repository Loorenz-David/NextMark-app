import type { Item, ItemMap, ItemQueryFilters, ItemUpdateFields } from '@shared-domain'
import type { ApiResult } from '../core'
import type { HttpApiClient } from '../http/createApiClient'

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

export const createItemsApi = (client: Pick<HttpApiClient, 'request'>) => ({
  getOrderItems: (
    orderId: number,
    query?: ItemQueryFilters,
  ): Promise<ApiResult<ItemListResponse>> =>
    client.request<ItemListResponse>({
      path: `/orders/${orderId}/items/`,
      method: 'GET',
      query,
    }),

  createItem: (payload: Item | Item[]): Promise<ApiResult<ItemCreateResponse>> =>
    client.request<ItemCreateResponse>({
      path: '/items/',
      method: 'POST',
      data: { fields: payload },
    }),

  updateItem: (
    payload: ItemUpdatePayload | ItemUpdatePayload[],
  ): Promise<ApiResult<Record<string, never>>> =>
    client.request<Record<string, never>>({
      path: '/items/',
      method: 'PATCH',
      data: { target: payload },
    }),

  deleteItem: (payload: ItemDeletePayload): Promise<ApiResult<Record<string, never>>> =>
    client.request<Record<string, never>>({
      path: '/items/',
      method: 'DELETE',
      data: payload,
    }),
})
