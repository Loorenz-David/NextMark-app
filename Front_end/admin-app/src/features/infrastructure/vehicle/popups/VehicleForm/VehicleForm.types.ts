export type VehicleFormMode = 'create' | 'edit'

export type VehicleFormPayload = {
  mode: VehicleFormMode
  clientId?: string
}

export type VehicleFormState = {
  name: string
  icon: string
  travel_mode: string
  cost_per_hour: string
  cost_per_kilometer: string
  travel_duration_limit: string
  route_distance_limit: string
  user_id: string
  max_load: string
  min_load: string
  is_system: boolean
}
