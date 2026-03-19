export type VehicleFormMode = 'create' | 'edit'

export type VehicleFormPayload = {
  mode: VehicleFormMode
  clientId?: string
}

export type VehicleFormState = {
  registration_number: string
  label: string
  fuel_type: string
  travel_mode: string
  max_volume_load_cm3: string
  max_weight_load_g: string
  max_speed_kmh: string
  cost_per_km: string
  cost_per_hour: string
  travel_distance_limit_km: string
  travel_duration_limit_minutes: string
  is_system: boolean
}
