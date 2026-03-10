import { apiClient } from '@/lib/api/ApiClient'
import type { ApiResult } from '@/lib/api/types'
import type {
  DeliveryPlan,
  DeliveryPlanMap,
  PlanCreatePayload,
  PlanCreateResponse,
  PlanUpdateFields,
} from '@/features/plan/types/plan'
import type { DeliveryPlanStateMap } from '@/features/plan/types/planState'
import type {
  PlanPagination,
  PlanQueryFilters,
  DeliveryPlanStatePagination,
  DeliveryPlanStateQueryFilters,
  PlanStats,
} from '@/features/plan/types/planMeta'

import type{ OrderListResponse } from "@/features/order/api/orderApi"

export type PlanListResponse = {
  delivery_plan: DeliveryPlanMap
  delivery_plan_stats: PlanStats
  delivery_plan_pagination: PlanPagination
}

export type PlanDetailResponse = {
  delivery_plan: DeliveryPlanMap | DeliveryPlan
}

export type DeliveryPlanStateListResponse = {
  plan_states: DeliveryPlanStateMap
  plan_states_pagination: DeliveryPlanStatePagination
}

export type PlanUpdatePayload = {
  target_id: number | string
  fields: PlanUpdateFields
}

export type PlanDeletePayload = {
  target_id?: number | string
  target_ids?: Array<number | string>
}

export const planApi = {
  listPlans: (query?: PlanQueryFilters): Promise<ApiResult<PlanListResponse>> =>
    apiClient.request<PlanListResponse>({
      path: '/plans/',
      method: 'GET',
      query,
    }),

  getPlan: (planId: number | string): Promise<ApiResult<PlanDetailResponse>> =>
    apiClient.request<PlanDetailResponse>({
      path: `/plans/${planId}`,
      method: 'GET',
    }),

  getPlanOrders: (planId: number | string, query?:any ): Promise<ApiResult<OrderListResponse>> =>
    apiClient.request<OrderListResponse>({
      path: `/plans/${planId}/orders/`,
      method: 'GET',
      query
    }),

  createPlan: (payload: PlanCreatePayload | PlanCreatePayload[]): Promise<ApiResult<PlanCreateResponse>> =>
    apiClient.request<PlanCreateResponse>({
      path: '/plans/',
      method: 'POST',
      data: { fields: payload },
    }),

  updatePlan: (payload: PlanUpdatePayload | PlanUpdatePayload[]): Promise<ApiResult<Record<string, never>>> =>
    apiClient.request<Record<string, never>>({
      path: '/plans/',
      method: 'PATCH',
      data: { target: payload },
    }),

  deletePlan: (payload: PlanDeletePayload): Promise<ApiResult<Record<string, never>>> =>
    apiClient.request<Record<string, never>>({
      path: '/plans/',
      method: 'DELETE',
      data: payload,
    }),

  listDeliveryPlanStates: (query?: DeliveryPlanStateQueryFilters): Promise<ApiResult<DeliveryPlanStateListResponse>> =>
    apiClient.request<DeliveryPlanStateListResponse>({
      path: '/plans/states/',
      method: 'GET',
      query,
    }),

  updateDeliveryPlanState: (planId: number | string, stateId: number | string): Promise<ApiResult<Record<string, never>>> =>
    apiClient.request<Record<string, never>>({
      path: `/plans/${planId}/state/${stateId}`,
      method: 'PATCH',
    }),
}

export type { ClientIdMap } from '@/features/plan/types/plan'
