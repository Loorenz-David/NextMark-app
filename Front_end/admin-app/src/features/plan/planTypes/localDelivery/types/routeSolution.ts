import type { address } from '@/types/address'
import type { ServiceTime } from '@/features/plan/planTypes/localDelivery/types/serviceTime'

export type RouteSolutionWarningBase = {
  type?: string
  severity?: string
  message?: string
}

export type RouteEndTimeExceededWarning = RouteSolutionWarningBase & {
  type: 'route_end_time_exceeded'
  route_expected_end?: string
  route_allowed_end?: string
}

export type RouteSolutionWarning =
  | RouteEndTimeExceededWarning
  | RouteSolutionWarningBase

export type RouteSolution = {
  id?: number
  client_id: string
  _representation?: 'partial' | 'full' | 'summary'
  score?:number | null
  label?: string | null
  is_selected?: boolean
  is_optimized?: string | null
  stop_count?: number | null
  start_leg_polyline?: string | null
  end_leg_polyline?: string | null
  total_distance_meters?: number | null
  total_travel_time_seconds?: number | null
  expected_start_time?: string | null
  expected_end_time?: string | null
  actual_start_time?: string | null
  actual_end_time?: string | null
  created_at?: string | null
  start_location?: address | null
  end_location?: address | null
  route_end_strategy: "round_trip" | "custom_end_address" | "end_at_last_stop"
  set_start_time?: string | null
  set_end_time?: string | null
  eta_tolerance_seconds?: number | null
  stops_service_time?: ServiceTime | null
  driver_id?: number | null
  local_delivery_plan_id?: number | null
  has_route_warnings?: boolean
  route_warnings?: RouteSolutionWarning[] | null
}

export type RouteSolutionMap = {
  byClientId: Record<string, RouteSolution>
  allIds: string[]
}
