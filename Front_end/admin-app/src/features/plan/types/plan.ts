import type { RouteGroupInput, RouteGroup } from '@/features/plan/routeGroup/types/routeGroup'
import type { RouteSolution } from '@/features/plan/routeGroup/types/routeSolution'
import type { ServiceTime } from '@/features/plan/routeGroup/types/serviceTime'
import type { address } from '@/types/address'

export type RoutePlanObjective = 'local_delivery'

export type DeliveryPlan = {
  id?: number
  client_id: string
  label: string
  start_date?: string | null
  end_date?: string | null
  created_at?: string | null
  updated_at?: string | null
  orders_ids?: number[]
  state_id?: number | null
  total_orders?: number | null
  total_items?: number | null
  total_volume?: number | null
  total_weight?: number | null
}

export type DeliveryPlanMap = {
  byClientId: Record<string, DeliveryPlan>
  allIds: string[]
}

export type DeliveryPlanFields = {
  client_id: string
  label: string
  start_date?: string | null
  end_date?: string | null
  state_id?: number | null
  total_orders?: number | null
  total_items?: number | null
  total_volume?: number | null
  total_weight?: number | null
}

export type PlanTypeFields = {
  local_delivery?: RouteGroupInput
}

export type PlanTypeStoreFields = {
  local_delivery_plan?: RouteGroupInput
}

export type RouteGroupDefaults = {
  route_solution?: {
    start_location?: address | null
    end_location?: address | null
    set_start_time?: string | null
    set_end_time?: string | null
    stops_service_time?: ServiceTime | null
    route_end_strategy?: 'round_trip' | 'custom_end_address' | 'end_at_last_stop'
    driver_id?: number | null
    eta_tolerance_seconds?: number | null
  }
}

export type PlanTypeDefaults = RouteGroupDefaults | Record<string, unknown>
export type RouteGroupPlanTypeDefaults = RouteGroupDefaults

export type PlanCreatePayload = {
  client_id?: string
  label: string
  start_date: string
  end_date?: string | null
  order_ids?: number[]
  plan_type_defaults?: PlanTypeDefaults
}

export type PlanUpdateFields = Partial<
  DeliveryPlanFields & PlanTypeFields & PlanTypeStoreFields & { order_ids?: number[] }
>

export type ClientIdMap = Record<string, number> & {
  ids_without_match?: number[]
}

export type PlanCreateResultBundle = {
  delivery_plan: DeliveryPlan
  route_group: RouteGroup
  route_solution?: RouteSolution
}

export type PlanCreateResponse = {
  created: PlanCreateResultBundle[]
}
