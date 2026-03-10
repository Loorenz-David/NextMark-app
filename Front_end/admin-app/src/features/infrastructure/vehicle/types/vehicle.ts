export type Vehicle = {
  id?: number
  client_id: string
  name: string
  icon?: string | null
  travel_mode?: string | null
  cost_per_hour?: number | null
  cost_per_kilometer?: number | null
  travel_duration_limit?: number | null
  route_distance_limit?: number | null
  user_id?: number | null
  max_load?: number | null
  min_load?: number | null
  is_system?: boolean
}

export type VehicleMap = {
  byClientId: Record<string, Vehicle>
  allIds: string[]
}

export type VehicleInput = Omit<Vehicle, 'id'>

export type ClientIdMap = Record<string, number> & {
  ids_without_match?: number[]
}

export type VehicleUpdatePayload = {
  target_id: number | string
  fields: Partial<VehicleInput>
}
