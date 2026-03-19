import type { InternationalShippingPlanInput } from '@/features/plan/types/internationalShippingPlan'
import type { InternationalShippingPlan } from '@/features/plan/types/internationalShippingPlan'
import type { LocalDeliveryPlanInput } from '@/features/plan/planTypes/localDelivery/types/localDeliveryPlan'
import type { LocalDeliveryPlan } from '@/features/plan/planTypes/localDelivery/types/localDeliveryPlan'
import type { StorePickupPlanInput } from '@/features/plan/types/storePickupPlan'
import type { StorePickupPlan } from '@/features/plan/types/storePickupPlan'
import type { RouteSolution } from '@/features/plan/planTypes/localDelivery/types/routeSolution'
import type { ServiceTime } from '@/features/plan/planTypes/localDelivery/types/serviceTime'
import type { address } from '@/types/address'

export const PLAN_TYPE_KEYS = [
  'local_delivery',
  'international_shipping',
  'store_pickup',
] as const

export type PlanTypeKey = typeof PLAN_TYPE_KEYS[number]

export const PLAN_TYPE_STORE_KEYS = [
  'local_delivery_plan',
  'international_shipping_plan',
  'store_pickup_plan',
] as const

export type PlanTypeStoreKey = typeof PLAN_TYPE_STORE_KEYS[number]

export type PlanTypePayloadKey = PlanTypeKey 

export const PLAN_TYPE_KEY_MAP: Record<PlanTypeStoreKey, PlanTypeKey> = {
  local_delivery_plan: 'local_delivery',
  international_shipping_plan: 'international_shipping',
  store_pickup_plan: 'store_pickup',
}

export const PLAN_TYPE_STORE_KEY_MAP: Record<PlanTypeKey, PlanTypeStoreKey> = {
  local_delivery: 'local_delivery_plan',
  international_shipping: 'international_shipping_plan',
  store_pickup: 'store_pickup_plan',
}

export type DeliveryPlan = {
  id?: number
  client_id: string
  label: string
  plan_type: PlanTypeKey
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
  plan_type: PlanTypePayloadKey
  start_date?: string | null
  end_date?: string | null
  state_id?: number | null
  total_orders?: number | null
  total_items?: number | null
  total_volume?: number | null
  total_weight?: number | null
}

export type PlanTypeFields = {
  local_delivery?: LocalDeliveryPlanInput
  international_shipping?: InternationalShippingPlanInput
  store_pickup?: StorePickupPlanInput
}



export type PlanTypeStoreFields = {
  local_delivery_plan?: LocalDeliveryPlanInput
  international_shipping_plan?: InternationalShippingPlanInput
  store_pickup_plan?: StorePickupPlanInput
}

export type LocalDeliveryPlanTypeDefaults = {
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

export type PlanTypeDefaults = LocalDeliveryPlanTypeDefaults | Record<string, unknown>

export type PlanCreatePayload = {
  client_id?: string
  label: string
  plan_type: PlanTypePayloadKey
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
  delivery_plan_type: LocalDeliveryPlan | InternationalShippingPlan | StorePickupPlan
  route_solution?: RouteSolution
}

export type PlanCreateResponse = {
  created: PlanCreateResultBundle[]
}
