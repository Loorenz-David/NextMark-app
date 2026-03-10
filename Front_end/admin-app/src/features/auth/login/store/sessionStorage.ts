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

type SessionListener = (session: SessionSnapshot | null) => void

const STORAGE_KEY = 'beyo.delivery.session'
const isBrowser = typeof window !== 'undefined'

export class SessionStorage {
  private listeners = new Set<SessionListener>()
  private cached: SessionSnapshot | null = null
  private key: string

  constructor(key: string = STORAGE_KEY) {
    this.key = key
    this.cached = this.read()
  }

  getSession(): SessionSnapshot | null {
    if (this.cached) {
      return this.cached
    }

    this.cached = this.read()
    return this.cached
  }

  setSession(session: Omit<SessionSnapshot, 'updatedAt'>): void {
    const next: SessionSnapshot = {
      ...session,
      updatedAt: Date.now(),
    }

    this.cached = next

    if (isBrowser) {
      window.localStorage.setItem(this.key, JSON.stringify(next))
    }

    this.emit(next)
  }

  clear(): void {
    this.cached = null

    if (isBrowser) {
      window.localStorage.removeItem(this.key)
    }

    this.emit(null)
  }

  subscribe(listener: SessionListener): () => void {
    this.listeners.add(listener)
    listener(this.getSession())

    return () => {
      this.listeners.delete(listener)
    }
  }

  private read(): SessionSnapshot | null {
    if (!isBrowser) {
      return null
    }

    try {
      const raw = window.localStorage.getItem(this.key)
      if (!raw) {
        return null
      }

      return JSON.parse(raw) as SessionSnapshot
    } catch (error) {
      console.warn('Failed to parse stored session, clearing it.', error)
      window.localStorage.removeItem(this.key)
      return null
    }
  }

  private emit(value: SessionSnapshot | null): void {
    this.listeners.forEach((listener) => listener(value))
  }
}

export const sessionStorage = new SessionStorage()
