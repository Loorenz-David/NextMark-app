export type Warehouse = {
  id?: number
  client_id: string
  name: string
  property_location?: Record<string, unknown> | null
}

export type WarehouseMap = {
  byClientId: Record<string, Warehouse>
  allIds: string[]
}

export type WarehouseInput = {
  client_id: string
  name: string
  property_location?: Record<string, unknown> | null
}

export type WarehouseUpdatePayload = {
  target_id: number | string
  fields: WarehouseInput
}
