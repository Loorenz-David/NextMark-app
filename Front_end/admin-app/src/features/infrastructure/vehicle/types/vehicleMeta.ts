export type VehiclePagination = {
  has_more: boolean
  next_cursor: {
    after_id: number
  } | null
  prev_cursor: {
    before_id: number
  } | null
}

export type VehicleQueryFilters = {
  team_id?: number | string
  client_id?: string
  name?: string
  travel_mode?: string
  user_id?: number
  is_system?: boolean
  sort?: 'id_asc' | 'id_desc'
  after_id?: number
  before_id?: number
  limit?: number
}
