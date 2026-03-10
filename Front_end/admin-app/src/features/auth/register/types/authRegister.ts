import type { Phone } from '@/types/phone'

export type RegisterFields = {
  username: string
  email: string
  password: string
  phone_number: Phone
}

export type RegisterResponse = Record<string, never>
