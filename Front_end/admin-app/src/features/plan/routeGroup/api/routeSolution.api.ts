import { apiClient } from '@/lib/api/ApiClient'
import type { ApiResult } from '@/lib/api/types'
import { serviceTimeMinutesToSeconds } from '@/features/plan/routeGroup/domain/serviceTimeUnits'

import type { RouteSolution, RouteSolutionMap } from '@/features/plan/routeGroup/types/routeSolution'
import type { ServiceTime } from '@/features/plan/routeGroup/types/serviceTime'
import type {
  RouteSolutionStop,
  RouteSolutionStopMap,
} from '@/features/plan/routeGroup/types/routeSolutionStop'

export type RouteSolutionUpdateResponse = {
  route_solution?: RouteSolution | RouteSolutionMap
  route_solution_stops?: RouteSolutionStop[] | RouteSolutionStopMap
}

export type RouteSolutionGetResponse = {
  route_solution?: RouteSolution | { byClientId: Record<string, RouteSolution>; allIds: string[] }
  route_solution_stop?: RouteSolutionStop[] | { byClientId: Record<string, RouteSolutionStop>; allIds: string[] }
}

export type RouteSolutionFullGetResponse = {
  route_solution: RouteSolution
  route_solution_stops: RouteSolutionStopMap
}

export type RouteSolutionAddressPayload = {
  route_solution_id: number
  start_location?: Record<string, unknown> | null
  end_location?: Record<string, unknown> | null
}

export type RouteSolutionTimesPayload = {
  route_solution_id: number
  set_start_time?: string | null
  set_end_time?: string | null
  eta_tolerance_seconds?: number
  stops_service_time?: ServiceTime | null
}

export type RouteStopServiceTimePayload = {
  service_time: ServiceTime | null
}

export type RouteStopGroupPositionPayload = {
  route_solution_id: number
  route_stop_ids: number[]
  position: number
  anchor_stop_id: number
}


export type RouteSolutionReadyResponse = {
  failed_order_state_updates:Record<number,string>
}

export const routeSolutionApi = {
  updateStopPosition: (
    routeStopId: number,
    position: number,
  ): Promise<ApiResult<RouteSolutionUpdateResponse>> =>
    apiClient.request<RouteSolutionUpdateResponse>({
      path: `/route_solutions/stops/${routeStopId}/position/${position}`,
      method: 'PATCH',
    }),

  updateStopGroupPosition: (
    payload: RouteStopGroupPositionPayload,
  ): Promise<ApiResult<RouteSolutionUpdateResponse>> =>
    apiClient.request<RouteSolutionUpdateResponse>({
      path: '/route_solutions/stops/group-position',
      method: 'PATCH',
      data: payload,
    }),

  updateStopServiceTime: (
    routeStopId: number,
    payload: RouteStopServiceTimePayload,
  ): Promise<ApiResult<RouteSolutionUpdateResponse>> =>
    apiClient.request<RouteSolutionUpdateResponse>({
      path: `/route_solutions/stops/${routeStopId}/service-time`,
      method: 'PATCH',
      data: {
        ...payload,
        service_time: serviceTimeMinutesToSeconds(payload.service_time),
      },
    }),

  selectRouteSolution: (
    routeSolutionId: number,
  ): Promise<ApiResult<RouteSolutionUpdateResponse>> =>
    apiClient.request<RouteSolutionUpdateResponse>({
      path: `/route_solutions/${routeSolutionId}/select`,
      method: 'PATCH',
    }),

  updateAddress: (
    payload: RouteSolutionAddressPayload,
  ): Promise<ApiResult<RouteSolutionUpdateResponse>> =>
    apiClient.request<RouteSolutionUpdateResponse>({
      path: '/route_solutions/address',
      method: 'PATCH',
      data: payload,
    }),

  updateTimes: (
    payload: RouteSolutionTimesPayload,
  ): Promise<ApiResult<RouteSolutionUpdateResponse>> =>
    apiClient.request<RouteSolutionUpdateResponse>({
      path: '/route_solutions/times',
      method: 'PATCH',
      data: {
        ...payload,
        stops_service_time: serviceTimeMinutesToSeconds(payload.stops_service_time),
      },
    }),

  getRouteSolution: (
    routeSolutionId: number,
    returnStops: boolean = false,
  ): Promise<ApiResult<RouteSolutionGetResponse>> =>
    apiClient.request<RouteSolutionGetResponse>({
      path: `/route_solutions/${routeSolutionId}`,
      method: 'GET',
      query: { return_stops: returnStops ? 'true' : 'false' },
    }),

  getRouteSolutionFull: (
    planId: number,
    routeGroupId: number,
    routeSolutionId: number,
  ): Promise<ApiResult<RouteSolutionFullGetResponse>> =>
    apiClient.request<RouteSolutionFullGetResponse>({
      path: `/route_plans/${planId}/route-groups/${routeGroupId}/route-solutions/${routeSolutionId}`,
      method: 'GET',
    }),

  selectRouteSolutionV2: (
    planId: number,
    routeGroupId: number,
    routeSolutionId: number,
  ): Promise<ApiResult<RouteSolutionUpdateResponse>> =>
    apiClient.request<RouteSolutionUpdateResponse>({
      path: `/route_plans/${planId}/route-groups/${routeGroupId}/route-solutions/${routeSolutionId}/select`,
      method: 'PATCH',
    }),

  routeReadyForDelivery: (
    deliveryPlanId: number,
  ): Promise<ApiResult<RouteSolutionReadyResponse>> =>
    apiClient.request<RouteSolutionReadyResponse>({
      path: `/route_plans/${deliveryPlanId}/route-is-ready`,
      method: 'PATCH',
    }),
}
