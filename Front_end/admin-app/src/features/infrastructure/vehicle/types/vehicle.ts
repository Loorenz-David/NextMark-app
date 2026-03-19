export type FuelType = 'bensine' | 'diesel' | 'electric'
export type TravelMode = 'DRIVING' | 'TWO_WHEELER' | 'BICYCLING' | 'WALKING'

export type Vehicle = {
  id?: number
  client_id: string
  registration_number: string
  label?: string | null
  fuel_type?: FuelType | null
  travel_mode?: TravelMode | null
  max_volume_load_cm3?: number | null
  max_weight_load_g?: number | null
  max_speed_kmh?: number | null
  cost_per_km?: number | null
  cost_per_hour?: number | null
  travel_distance_limit_km?: number | null
  travel_duration_limit_minutes?: number | null
  is_system?: boolean
  team_id?: number | null
}

export type VehicleMap = {
  byClientId: Record<string, Vehicle>
  allIds: string[]
}

export type VehicleInput = Omit<Vehicle, 'id'>

export type VehicleUpdatePayload = {
  target_id: number | string
  fields: Partial<VehicleInput>
}
