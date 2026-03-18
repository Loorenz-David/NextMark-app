// Types shared across the client-form-app

export interface ClientFormMeta {
  reference_number: string;
  team_name: string;
  items: ClientFormItem[];
  expires_at: string; // ISO datetime
}

export interface ClientFormItem {
  name: string;
  quantity: number;
  description?: string;
}

export interface ClientFormPayload {
  client_first_name: string;
  client_last_name: string;
  client_email: string;
  client_primary_phone: string;
  client_secondary_phone?: string;
  client_address: ClientAddress;
}

export interface ClientAddress {
  street: string;
  city: string;
  state?: string;
  postal_code: string;
  country: string;
  notes?: string;
}

export type ClientFormStatus =
  | { state: "loading" }
  | { state: "ready"; meta: ClientFormMeta }
  | { state: "expired" }
  | { state: "already_submitted" }
  | { state: "invalid" }
  | { state: "submitted" };
