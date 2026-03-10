import type { SessionUser } from '@/features/auth/login/store/sessionStorage'

export type LoginPayload = {
  email: string
  password: string
  time_zone: string
}

export type LoginResponse = {
  access_token: string
  refresh_token: string
  socket_token?: string
  user?: SessionUser | null
}
