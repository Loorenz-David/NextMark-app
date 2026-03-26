import { useCallback } from 'react'

import { apiClient } from '@/lib/api/ApiClient'
import type { ApiResult } from '@/lib/api/types'

import type { Vehicle, VehicleInput, VehicleMap } from '../types/vehicle'

export type VehicleConflict = {
  route_solution_id: number
  route_plan_id: number
  route_plan_label: string | null
  start_date: string
  end_date: string
}

export type VehicleAvailabilityResponse = {
  conflicts: VehicleConflict[]
}

export type VehicleListResponse = {
  vehicle: VehicleMap
  vehicle_pagination: {
    page: number
    per_page: number
    total: number
  }
}

export type VehicleDetailResponse = {
  vehicle: Vehicle | VehicleMap
}

export type VehicleUpdatePayload = {
  target_id: number | string
  fields: VehicleInput
}

export type VehicleDeletePayload = {
  target_id?: number | string
  target_ids?: Array<number | string>
}

export const vehicleApi = {
  list: (): Promise<ApiResult<VehicleListResponse>> =>
    apiClient.request<VehicleListResponse>({
      path: '/infrastructures/vehicle/',
      method: 'GET',
    }),

  getById: (vehicleId: number | string): Promise<ApiResult<VehicleDetailResponse>> =>
    apiClient.request<VehicleDetailResponse>({
      path: `/infrastructures/vehicle/${vehicleId}`,
      method: 'GET',
    }),

  create: (payload: VehicleInput | VehicleInput[]): Promise<ApiResult<Record<string, number>>> =>
    apiClient.request<Record<string, number>>({
      path: '/infrastructures/vehicle/',
      method: 'POST',
      data: { fields: payload },
    }),

  update: (payload: VehicleUpdatePayload | VehicleUpdatePayload[]): Promise<ApiResult<Record<string, never>>> =>
    apiClient.request<Record<string, never>>({
      path: '/infrastructures/vehicle/',
      method: 'PATCH',
      data: { target: payload },
    }),

  remove: (payload: VehicleDeletePayload): Promise<ApiResult<Record<string, never>>> =>
    apiClient.request<Record<string, never>>({
      path: '/infrastructures/vehicle/',
      method: 'DELETE',
      data: payload,
    }),

  checkAvailability: (params: {
    vehicleId: number
    startDate: string
    endDate: string
    excludeRouteSolutionId?: number | null
  }): Promise<ApiResult<VehicleAvailabilityResponse>> =>
    apiClient.request<VehicleAvailabilityResponse>({
      path: `/infrastructures/vehicle/${params.vehicleId}/availability`,
      method: 'GET',
      query: {
        start_date: params.startDate,
        end_date: params.endDate,
        ...(params.excludeRouteSolutionId != null
          ? { exclude_route_solution_id: String(params.excludeRouteSolutionId) }
          : {}),
      },
    }),
}

export const useGetVehicles = () => useCallback(() => vehicleApi.list(), [])

export const useGetVehicle = () =>
  useCallback((vehicleId: number | string) => vehicleApi.getById(vehicleId), [])

export const useCreateVehicle = () =>
  useCallback((payload: VehicleInput | VehicleInput[]) => vehicleApi.create(payload), [])

export const useUpdateVehicle = () =>
  useCallback((payload: VehicleUpdatePayload | VehicleUpdatePayload[]) => vehicleApi.update(payload), [])

export const useDeleteVehicle = () =>
  useCallback((payload: VehicleDeletePayload) => vehicleApi.remove(payload), [])
