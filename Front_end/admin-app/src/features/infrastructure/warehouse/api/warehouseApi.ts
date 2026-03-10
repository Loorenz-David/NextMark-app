import { useCallback } from 'react'

import { apiClient } from '@/lib/api/ApiClient'
import type { ApiResult } from '@/lib/api/types'

import type { Warehouse, WarehouseInput, WarehouseMap, WarehouseUpdatePayload } from '../types/warehouse'

export type WarehouseListResponse = {
  warehouses: WarehouseMap
  warehouses_pagination: {
    page: number
    per_page: number
    total: number
  }
}

export type WarehouseDetailResponse = {
  warehouse: Warehouse | WarehouseMap
}

export const warehouseApi = {
  list: (): Promise<ApiResult<WarehouseListResponse>> =>
    apiClient.request<WarehouseListResponse>({
      path: '/infrastructures/warehouses/',
      method: 'GET',
    }),

  getById: (warehouseId: number | string): Promise<ApiResult<WarehouseDetailResponse>> =>
    apiClient.request<WarehouseDetailResponse>({
      path: `/infrastructures/warehouses/${warehouseId}`,
      method: 'GET',
    }),

  create: (payload: WarehouseInput | WarehouseInput[]): Promise<ApiResult<Record<string, number>>> =>
    apiClient.request<Record<string, number>>({
      path: '/infrastructures/warehouses/',
      method: 'POST',
      data: { fields: payload },
    }),

  update: (payload: WarehouseUpdatePayload | WarehouseUpdatePayload[]): Promise<ApiResult<Record<string, never>>> =>
    apiClient.request<Record<string, never>>({
      path: '/infrastructures/warehouses/',
      method: 'PATCH',
      data: { target: payload },
    }),

  remove: (payload: { target_id?: number | string; target_ids?: Array<number | string> }):
  Promise<ApiResult<Record<string, never>>> =>
    apiClient.request<Record<string, never>>({
      path: '/infrastructures/warehouses/',
      method: 'DELETE',
      data: payload,
    }),
}

export const useGetWarehouses = () => useCallback(() => warehouseApi.list(), [])

export const useGetWarehouse = () =>
  useCallback((warehouseId: number | string) => warehouseApi.getById(warehouseId), [])

export const useCreateWarehouse = () =>
  useCallback((payload: WarehouseInput | WarehouseInput[]) => warehouseApi.create(payload), [])

export const useUpdateWarehouse = () =>
  useCallback((payload: WarehouseUpdatePayload | WarehouseUpdatePayload[]) => warehouseApi.update(payload), [])

export const useDeleteWarehouse = () =>
  useCallback((payload: { target_id?: number | string; target_ids?: Array<number | string> }) =>
    warehouseApi.remove(payload), [])
