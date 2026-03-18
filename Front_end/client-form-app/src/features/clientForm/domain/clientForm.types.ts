export type ClientFormData = {
  client_first_name: string
  client_last_name: string
  client_primary_phone: string
  client_secondary_phone: string
  client_email: string
  client_address: ClientAddress | null
}

export type ClientAddress = {
  street: string
  city: string
  state: string
  postal_code: string
  country: string
  notes: string
}

export type ClientFormStep = 'client_info' | 'contact_info' | 'delivery_address'

export type ClientFormMeta = {
  reference_number: string
  team_name: string
  items: ClientFormItem[]
  expires_at: string
}

export type ClientFormItem = {
  name: string
  quantity: number
  description?: string
}

export type ClientFormStatus =
  | { state: 'loading' }
  | { state: 'ready' }
  | { state: 'expired' }
  | { state: 'already_submitted' }
  | { state: 'invalid' }
  | { state: 'submitted' }
