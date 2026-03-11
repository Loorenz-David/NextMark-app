import type { address } from '../core'
import type { ISODateTime } from '../types'
import type { ServiceTime } from './serviceTime'

export type RouteSolutionWarningBase = {
  type?: string
  severity?: string
  message?: string
}

export type RouteEndTimeExceededWarning = RouteSolutionWarningBase & {
  type: 'route_end_time_exceeded'
  route_expected_end?: ISODateTime
  route_allowed_end?: ISODateTime
}

export type RouteSolutionWarning =
  | RouteEndTimeExceededWarning
  | RouteSolutionWarningBase

export type RouteEndStrategy = 'round_trip' | 'custom_end_address' | 'end_at_last_stop'

export type RouteSolutionRepresentation = 'partial' | 'full' | 'summary'

export type RouteSolution = {
  id?: number
  client_id: string
  _representation?: RouteSolutionRepresentation
  score?: number | null
  label?: string | null
  is_selected?: boolean
  is_optimized?: string | null
  stop_count?: number | null
  start_leg_polyline?: string | null
  end_leg_polyline?: string | null
  total_distance_meters?: number | null
  total_travel_time_seconds?: number | null
  expected_start_time?: ISODateTime | null
  expected_end_time?: ISODateTime | null
  actual_start_time?: ISODateTime | null
  actual_end_time?: ISODateTime | null
  created_at?: ISODateTime | null
  start_location?: address | null
  end_location?: address | null
  route_end_strategy: RouteEndStrategy
  set_start_time?: ISODateTime | null
  set_end_time?: ISODateTime | null
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
