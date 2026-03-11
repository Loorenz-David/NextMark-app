export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

export interface SessionUser {
  id?: string | number
  client_id?: string
  email?: string
  teamId?: string | number | null
  username?: string
  phone_number?: string | null
  profile_picture?: string | null
  user_role_id?: number | null
  base_role_id?: number | null
  show_app_tutorial?: boolean
  [key: string]: unknown
}

export interface SessionIdentity {
  user_id?: string | number
  team_id?: string | number | null
  user_role_id?: number | null
  base_role_id?: number | null
  time_zone?: string | null
  [key: string]: unknown
}

export interface SessionSnapshot {
  accessToken: string
  refreshToken: string
  socketToken?: string
  user?: SessionUser | null
  identity?: SessionIdentity | null
  updatedAt: number
}

export interface SessionAccessor {
  getSession(): SessionSnapshot | null
  setSession(session: Omit<SessionSnapshot, 'updatedAt'>): void
  clear(): void
}

export type QueryPrimitive =
  | string
  | number
  | boolean
  | null
  | undefined
  | Record<string, unknown>

export type QueryValue =
  | QueryPrimitive
  | QueryPrimitive[]

export interface RequestOptions<
  TBody = unknown,
  TQuery = Record<string, QueryValue>,
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

export interface SerializePayloadResult {
  json: string
  bytes: Uint8Array
}

export interface ApiClientConfig {
  baseUrl: string
  refreshPath: string
  sessionAccessor: SessionAccessor
  onUnauthenticated?: () => void
  fetchImpl?: typeof fetch
  serializePayload?: (payload: unknown) => SerializePayloadResult
  gzipPayload?: (bytes: Uint8Array) => Uint8Array
  maxCompressedBytes?: number
  maxDecompressedBytes?: number
}
