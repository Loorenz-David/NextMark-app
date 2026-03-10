import type { address } from '@/types/address'

export type WarehouseFormMode = 'create' | 'edit'

export type WarehouseFormPayload = {
  mode: WarehouseFormMode
  clientId?: string
}

export type WarehouseFormState = {
  name: string
  property_location: address | null
}
