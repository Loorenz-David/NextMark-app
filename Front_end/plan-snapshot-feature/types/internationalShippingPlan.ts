export type InternationalShippingPlan = {
  id?: number
  client_id: string
  carrier_name?: string | null
  delivery_plan_id?: number | null
}

export type InternationalShippingPlanMap = {
  byClientId: Record<string, InternationalShippingPlan>
  allIds: string[]
}

export type InternationalShippingPlanInput = Omit<InternationalShippingPlan, 'id'>
