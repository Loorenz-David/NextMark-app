import { gzipPayload, serializePayload, MAX_COMPRESSED_BYTES, MAX_DECOMPRESSED_BYTES } from './compression'
import type { ApiClientOptions, ApiEnvelope, ApiErrorPayload, ApiResult, RequestOptions } from './types'

import type { SessionIdentity, SessionSnapshot, SessionUser } from '@/features/auth/login/store/sessionStorage'
import { sessionStorage } from '@/features/auth/login/store/sessionStorage'

export class ApiError extends Error {
  public readonly status: number
  public readonly payload?: ApiErrorPayload

  constructor(message: string, status: number, payload?: ApiErrorPayload) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.payload = payload
  }
}

export class ApiClient {
  private readonly baseUrl: string
  private readonly refreshPath: string
  private readonly fetchImpl: typeof fetch
  private refreshPromise: Promise<boolean> | null = null
  private options: ApiClientOptions

  constructor(options: ApiClientOptions) {
    this.options = options
    this.baseUrl = options.baseUrl.replace(/\/$/, '')
    this.refreshPath = options.refreshPath
    this.fetchImpl = options.fetchImpl ?? fetch.bind(globalThis)
  }

  setUnauthenticatedHandler(handler?: () => void): void {
    this.options.onUnauthenticated = handler
  }

  getAccessToken(): string | null {
    return this.options.sessionStorage.getSession()?.accessToken ?? null
  }

  getRefreshToken(): string | null {
    return this.options.sessionStorage.getSession()?.refreshToken ?? null
  }

  getSocketToken(): string | null {
    return this.options.sessionStorage.getSession()?.socketToken ?? null
  }

  getSessionUserId(): string | number | null {
    const session = this.options.sessionStorage.getSession()
    return session?.user?.id ?? null
  }

  getSessionUser(): SessionUser | null {
    const session = this.options.sessionStorage.getSession()
    return session?.user ?? null
  }

  getSessionIdentity(): SessionIdentity | null {
    const session = this.options.sessionStorage.getSession()
    return session?.identity ?? null
  }

  getSessionTimeZone(): string | null {
    const timeZone = this.getSessionIdentity()?.time_zone
    return typeof timeZone === 'string' && timeZone.trim() ? timeZone.trim() : null
  }

  async request<T>(options: RequestOptions, attempt = 0): Promise<ApiResult<T>> {
    const {
      path,
      method = 'GET',
      data,
      compress = false,
      headers = {},
      signal,
      requiresAuth = true,
      query,
    } = options

    const url = this.composeUrl(path, query)
    const session = this.options.sessionStorage.getSession()
    
    const finalHeaders: Record<string, string> = {
      ...headers,
    }

    if (requiresAuth && session?.accessToken) {
      finalHeaders.Authorization = `Bearer ${session.accessToken}`
    }

    let body: BodyInit | undefined
    if (data !== undefined) {
      const built = this.buildRequestBody(data, compress)
      body = built.body
      Object.assign(finalHeaders, built.headers)
    }

    const response = await this.fetchImpl(url, {
      method,
      headers: finalHeaders,
      body,
      signal,
      cache: requiresAuth ? 'no-store' : 'default'
    })
   
    const rawText = await response.text()
    const envelope = rawText ? this.parseEnvelope<ApiEnvelope<unknown>>(rawText) : undefined
    if (rawText && !envelope) {
      throw new ApiError('Invalid response from server', response.status)
    }
    if (requiresAuth && this.isAuthError(response.status, envelope)) {
      if (attempt === 0 && (await this.tryRefresh())) {
        return this.request(options, attempt + 1)
      }

      this.handleUnauthenticated()
      const errorPayload = this.asErrorPayload(envelope)
      throw new ApiError(errorPayload?.error || 'Unauthorized', response.status, errorPayload)
    }

    if (!response.ok) {
      const errorPayload = this.asErrorPayload(envelope)
      throw new ApiError(
        errorPayload?.error || response.statusText || 'Request failed',
        response.status,
        errorPayload,
      )
    }

    if (!envelope) {
      return {
        data: null as T,
        warnings: [],
        status: response.status,
      }
    }

    if (!('data' in envelope)) {
      throw new ApiError('Invalid response from server', response.status)
    }

    const success = envelope as { data: T; warnings?: string[] }
    return {
      data: success.data,
      warnings: success.warnings ?? [],
      status: response.status,
    }
  }

  private buildRequestBody(
    data: unknown,
    compress: boolean,
  ): { body: BodyInit; headers: Record<string, string> } {
    if (typeof FormData !== 'undefined' && data instanceof FormData) {
      return {
        body: data,
        headers: {},
      }
    }

    const { json, bytes } = serializePayload(data)

    if (bytes.byteLength > MAX_DECOMPRESSED_BYTES) {
      throw new ApiError('Payload too large', 413)
    }

    if (!compress) {
      return {
        body: json,
        headers: { 'Content-Type': 'application/json' },
      }
    }

    const compressed = gzipPayload(bytes)
    if (compressed.byteLength > MAX_COMPRESSED_BYTES) {
      throw new ApiError('Compressed payload too large', 413)
    }

    return {
      body: new Uint8Array(compressed).buffer,
      headers: {
        'Content-Type': 'application/json',
        'Content-Encoding': 'gzip',
      },
    }
  }

  private parseEnvelope<T>(rawText: string): T | undefined {
    try {
      return JSON.parse(rawText) as T
    } catch (error) {
      console.warn('Failed to parse API response', error)
      return undefined
    }
  }

  private isAuthError(status: number, envelope?: ApiEnvelope<unknown>): boolean {
    if (status === 413) {
      return true
    }
    

    const errorPayload = this.asErrorPayload(envelope)
    if (!errorPayload?.error) {
      return false
    }

    const message = errorPayload.error.toLowerCase()
    return message.includes('token') || message.includes('authorization')
  }

  private asErrorPayload(envelope?: ApiEnvelope<unknown>): ApiErrorPayload | undefined {
    if (!envelope || typeof envelope !== 'object') {
      return undefined
    }

    if ('error' in envelope) {
      const error = (envelope as { error?: unknown }).error
      if (typeof error === 'string') {
        const code = 'code' in envelope ? (envelope as { code?: string }).code : undefined
        return { error, code }
      }
    }

    return undefined
  }

  private composeUrl(path: string, query?: RequestOptions['query']): string {
    const trimmedPath = path.startsWith('http') ? path : `${this.baseUrl}${path.startsWith('/') ? '' : '/'}${path}`

    if (!query) {
      return trimmedPath
    }

    const queryString = Object.entries(query)
      .filter(([, value]) => value !== undefined && value !== null)
      .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
      .join('&')

    return queryString ? `${trimmedPath}?${queryString}` : trimmedPath
  }

  private async tryRefresh(): Promise<boolean> {
    if (this.refreshPromise) {
      return this.refreshPromise
    }

    const existing = this.options.sessionStorage.getSession()
    if (!existing?.refreshToken) {
      return false
    }

    const { refreshToken } = existing
    this.refreshPromise = (async () => {
      const response = await this.fetchImpl(this.composeUrl(this.refreshPath), {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${refreshToken}`,
        },
      })
      
      if (!response.ok) {
        throw new Error('Refresh token rejected')
      }

      const rawText = await response.text()
      if (!rawText) {
        throw new Error('Empty refresh response')
      }

      const envelope = this.parseEnvelope<ApiEnvelope<Record<string, string>>>(rawText)
      if (!envelope || !('data' in envelope)) {
        throw new Error('Invalid refresh response')
      }

      const data = envelope.data
      const nextAccess = data?.access_token
      const nextSocket = data?.socket_token

      if (!nextAccess) {
        throw new Error('Refresh response missing access token')
      }

      this.options.sessionStorage.setSession(this.normalizeSession({
        ...existing,
        accessToken: nextAccess,
        socketToken: nextSocket ?? existing.socketToken,
      }))
      return true
    })()
      .catch((error) => {
        console.warn('Token refresh failed', error)
        this.handleUnauthenticated()
        return false
      })
      .finally(() => {
        this.refreshPromise = null
      })

    return this.refreshPromise
  }

  replaceTokens(
    nextAccessToken: string,
    nextRefreshToken: string,
    nextSocketToken?: string,
    nextUser?: SessionUser | null,
  ): void {
    const existing = this.options.sessionStorage.getSession()
    const base: Partial<SessionSnapshot> = existing ?? {}
    this.options.sessionStorage.setSession(this.normalizeSession({
      accessToken: nextAccessToken,
      refreshToken: nextRefreshToken,
      socketToken: nextSocketToken ?? base.socketToken,
      user: nextUser ?? base.user ?? null,
      identity: base.identity ?? null,
    }))
  }

  setSession(session: Omit<SessionSnapshot, 'updatedAt'>): void {
    this.options.sessionStorage.setSession(this.normalizeSession(session))
  }

  clearSession(): void {
    this.options.sessionStorage.clear()
  }

  private handleUnauthenticated(): void {
    // this.options.sessionStorage.clear()
    this.options.onUnauthenticated?.()
  }

  private normalizeSession(session: Omit<SessionSnapshot, 'updatedAt'>): Omit<SessionSnapshot, 'updatedAt'> {
    const tokenIdentity = decodeJwtIdentity(session.accessToken)
    const mergedIdentity = tokenIdentity ?? session.identity ?? null
    return {
      ...session,
      identity: mergedIdentity,
      user: this.mergeSessionUser(session.user ?? null, mergedIdentity),
    }
  }

  private mergeSessionUser(
    user: SessionUser | null | undefined,
    identity: SessionIdentity | null,
  ): SessionUser | null {
    if (!user && !identity) {
      return null
    }

    const nextUser: SessionUser = { ...(user ?? {}) }
    const teamId = identity?.team_id
    if (teamId !== undefined) {
      nextUser.teamId = teamId
    }
    const userRoleId = identity?.user_role_id
    if (typeof userRoleId === 'number') {
      nextUser.user_role_id = userRoleId
    }
    const baseRoleId = identity?.base_role_id
    if (typeof baseRoleId === 'number') {
      nextUser.base_role_id = baseRoleId
    }
    return nextUser
  }
}


const decodeJwtIdentity = (token: string | null | undefined): SessionIdentity | null => {
  if (!token) {
    return null
  }

  const parts = token.split('.')
  if (parts.length < 2) {
    return null
  }

  try {
    const payload = decodeBase64Url(parts[1] ?? '')
    const parsed = JSON.parse(payload) as Record<string, unknown>
    if (!parsed || typeof parsed !== 'object') {
      return null
    }
    return parsed as SessionIdentity
  } catch (error) {
    console.warn('Failed to decode access token identity', error)
    return null
  }
}

const decodeBase64Url = (value: string): string => {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/')
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=')

  if (typeof globalThis.atob === 'function') {
    const decoded = globalThis.atob(padded)
    return decodeURIComponent(
      Array.from(decoded)
        .map((char) => `%${char.charCodeAt(0).toString(16).padStart(2, '0')}`)
        .join(''),
    )
  }

  throw new Error('Base64 decoder unavailable')
}


// check the back end api to understand the encription of token,
// the refresh token is set to expired in 7 days the access token in 1 hour
// one can pass as fetch for testing

export const apiClient = new ApiClient({
  baseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api_v2',
  refreshPath: '/auths/refresh_token',
  sessionStorage,
})


// access token will be received as {access_token: "some_token", }
// the access token is then store in the session with camel case accessToken
// same for refresh_token ...
