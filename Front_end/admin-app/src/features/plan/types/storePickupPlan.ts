import type { address } from '@/types/address'

export type StorePickupPlan = {
  id?: number
  client_id: string
  delivery_plan_id?: number | null
  pickup_location?: address | null
  assigned_user_id?: number | null
}

export type StorePickupPlanMap = {
  byClientId: Record<string, StorePickupPlan>
  allIds: string[]
}

export type StorePickupPlanInput = Omit<StorePickupPlan, 'id'>
