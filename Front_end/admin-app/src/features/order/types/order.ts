import type { address } from '@/types/address'
import type { Phone } from '@/types/phone'
import type { RouteSolution } from '@/features/plan/planTypes/localDelivery/types/routeSolution'
import type { RouteSolutionStop } from '@/features/plan/planTypes/localDelivery/types/routeSolutionStop'
import type { Item } from '@/features/order/item'

export type OrderDeliveryWindowType =
  | 'EXACT_DATETIME'
  | 'DATE_ONLY'
  | 'TIME_RANGE'
  | 'DATE_RANGE'
  | 'FULL_RANGE'

export type OrderOperationTypes =
  | 'pickup'
  | 'dropoff'
  | 'pickup_dropoff'

export type OrderDeliveryWindow = {
  id?: number
  client_id?: string | null
  start_at: string
  end_at: string
  window_type: OrderDeliveryWindowType
}


export type Order = {
  id?: number
  client_id: string
  order_plan_objective?: string | null
  operation_type?: OrderOperationTypes | null
  order_scalar_id?: number | null
  reference_number?: string | null
  external_order_id?: string | null
  external_source?: string | null
  tracking_number?: string | null
  tracking_link?: string | null

  client_first_name?: string | null
  client_last_name?: string | null
  client_email?: string | null
  client_primary_phone?: Phone | null
  client_secondary_phone?: Phone | null

  client_address?: address | null
  costumer_id?: number | null
  costumer?: {
    costumer_id?: number | null
    client_id?: string | null
  } | null
  
  earliest_delivery_date?: string | null
  latest_delivery_date?: string | null
  preferred_time_start?: string | null
  preferred_time_end?: string | null
  delivery_windows?: OrderDeliveryWindow[]
  creation_date?: string | null
  items_updated_at?: string | null
  order_state_id?: number | null
  delivery_plan_id?: number | null
  total_weight?: number | null
  total_items?: number | null
  total_volume?: number | null
  open_order_cases?: number | null
  archive_at?: string | null
  __optimistic?: boolean
}

export type OrderMap = {
  byClientId: Record<string, Order>
  allIds: string[]
}

export type OrderUpdateFields = Partial<Order>

export type OrderCreatePayload = Order | Order[]

export type ClientIdMap = Record<string, number> & {
  ids_without_match?: number[]
}

export type OrderStopResponseMap = Record<string, RouteSolutionStop> & {
  ids_without_match?: number[]
}

export type OrderCreateBundle = {
  order: Order
  items?: Item[]
  order_stops?: RouteSolutionStop[]
  route_solution?: RouteSolution[]
}

export type OrderCreateResponse = {
  created: OrderCreateBundle[]
}

export type OrderPlanUpdateResponse = {
  updated: Array<{
    order: Order
    order_stops?: RouteSolutionStop[]
    route_solution?: RouteSolution[]
  }>
}

export type OrderUpdateResponse = {
  updated: Array<{
    order: Order
    order_stops?: RouteSolutionStop[]
    route_solution?: RouteSolution[]
  }>
}

export type OrderDeleteResponse = {
  deleted: {
    order_ids: number[]
    order_client_ids: string[]
  }
  updated: Array<{
    route_solution?: RouteSolution[]
    order_stops?: RouteSolutionStop[]
  }>
}
