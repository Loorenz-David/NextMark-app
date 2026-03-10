import type { SessionStorage, SessionSnapshot } from '@/features/auth/login/store/sessionStorage'

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

export interface ApiSuccess<T = unknown> {
  data: T
  warnings: string[]
  status?: number
  message?: string
}

export interface ApiErrorPayload {
  error: string
  code?: string
}

export type ApiEnvelope<T = unknown> = ApiSuccess<T> | ApiErrorPayload

export type ApiResult<T> = ApiSuccess<T>

export type QueryPrimitive =
  | string
  | number
  | boolean
  | null
  | undefined
  | Record<string,unknown>

export type QueryValue =
  | QueryPrimitive
  | QueryPrimitive[]


export interface RequestOptions<
TBody = unknown,
TQuery = Record<string, QueryValue>
> {
  path: string
  method?: HttpMethod
  data?: TBody
  compress?: boolean
  headers?: Record<string, string>
  signal?: AbortSignal
  requiresAuth?: boolean
  query?: TQuery
}

export interface ApiClientOptions {
  baseUrl: string
  refreshPath: string
  sessionStorage: SessionStorage
  onUnauthenticated?: () => void
  fetchImpl?: typeof fetch
}

export type SessionAccessor = Pick<SessionStorage, 'getSession' | 'setSession' | 'clear'>

export type SessionUpdater = (session: SessionSnapshot | null) => void
