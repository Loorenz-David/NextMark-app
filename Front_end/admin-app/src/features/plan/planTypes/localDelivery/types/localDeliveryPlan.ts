
export type LoadingScenarios = 
  | 'isOptimizing'

export type LocalDeliveryPlan = {
  id?:number
  client_id: string
  actual_start_time?: string | null
  actual_end_time?: string | null
  is_optimized?: boolean
  driver_id?: number | null
  delivery_plan_id?: number | null
  updated_at?: string | null
  route_solutions_ids?: number[]
  is_loading?: LoadingScenarios
  optimization_started_at?: number | null
}

export type LocalDeliveryPlanMap = {
  byClientId: Record<string, LocalDeliveryPlan>
  allIds: string[]
}

export type LocalDeliveryPlanInput = Omit<LocalDeliveryPlan, 'id'>
