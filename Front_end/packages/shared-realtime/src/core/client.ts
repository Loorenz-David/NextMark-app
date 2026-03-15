import type { SessionAccessor, SessionSnapshot } from '@shared-api'
import {
  REALTIME_CLIENT_EVENTS,
  type RealtimeChannelId,
  type RealtimeChannelParamsMap,
  type RealtimeSubscriptionPayload,
} from '../contracts'
import { SocketIoTransport } from '../transport/socketIoTransport'

type SessionSource = SessionAccessor & {
  subscribe?: (listener: (session: SessionSnapshot | null) => void) => () => void
}

type RealtimeClientConfig = {
  baseUrl: string
  sessionAccessor: SessionSource
}

type SubscriptionRecord = {
  channel: RealtimeChannelId
  params: RealtimeChannelParamsMap[RealtimeChannelId] | undefined
  count: number
}

const stableStringify = (value: unknown): string => {
  if (Array.isArray(value)) {
    return `[${value.map((item) => stableStringify(item)).join(',')}]`
  }

  if (value && typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>).sort(([left], [right]) => left.localeCompare(right))
    return `{${entries.map(([key, nested]) => `${JSON.stringify(key)}:${stableStringify(nested)}`).join(',')}}`
  }

  return JSON.stringify(value)
}

const buildSubscriptionKey = <Channel extends RealtimeChannelId>(
  channel: Channel,
  params?: RealtimeChannelParamsMap[Channel],
) => `${channel}:${stableStringify(params ?? {})}`

const deriveSocketUrl = (baseUrl: string): string => {
  const normalizedBaseUrl = baseUrl.trim()
  const explicitSocketUrl = (import.meta.env.VITE_SOCKET_URL as string | undefined)?.trim()
  if (explicitSocketUrl) {
    return explicitSocketUrl
  }

  try {
    const parsed = new URL(normalizedBaseUrl)
    return `${parsed.protocol}//${parsed.host}`
  } catch {
    return normalizedBaseUrl
  }
}

export class SharedRealtimeClient {
  private readonly baseUrl: string
  private readonly sessionAccessor: SessionSource
  private readonly transport = new SocketIoTransport()
  private readonly subscriptions = new Map<string, SubscriptionRecord>()
  private currentSocketToken: string | null = null
  private readonly removeSessionListener?: () => void

  constructor(config: RealtimeClientConfig) {
    this.baseUrl = config.baseUrl
    this.sessionAccessor = config.sessionAccessor

    this.transport.onConnectionChange((connected) => {
      if (connected) {
        this.resubscribeAll()
      }
    })

    if (typeof this.sessionAccessor.subscribe === 'function') {
      this.removeSessionListener = this.sessionAccessor.subscribe((session) => {
        const nextToken = session?.socketToken ?? null

        if (!nextToken) {
          this.currentSocketToken = null
          this.transport.disconnect()
          return
        }

        if (nextToken !== this.currentSocketToken) {
          this.connect()
        }
      })
    }
  }

  connect(): boolean {
    const nextToken = this.sessionAccessor.getSession()?.socketToken ?? null
    if (!nextToken) {
      return false
    }

    this.currentSocketToken = nextToken
    this.transport.ensureConnection({
      socketUrl: deriveSocketUrl(this.baseUrl),
      token: nextToken,
    })

    return true
  }

  disconnect(): void {
    this.currentSocketToken = null
    this.transport.disconnect()
  }

  destroy(): void {
    this.removeSessionListener?.()
    this.disconnect()
  }

  isConnected(): boolean {
    return this.transport.isConnected()
  }

  on<TPayload>(event: string, handler: (payload: TPayload) => void): () => void {
    const release = this.transport.on(event, (payload) => {
      handler(payload as TPayload)
    })
    this.connect()
    return release
  }

  subscribe<Channel extends RealtimeChannelId>(
    channel: Channel,
    params?: RealtimeChannelParamsMap[Channel],
  ): () => void {
    const key = buildSubscriptionKey(channel, params)
    const existing = this.subscriptions.get(key)

    if (existing) {
      existing.count += 1
      return () => {
        this.unsubscribe(channel, params)
      }
    }

    this.subscriptions.set(key, {
      channel,
      params: params as RealtimeChannelParamsMap[RealtimeChannelId] | undefined,
      count: 1,
    })

    this.connect()

    if (this.transport.isConnected()) {
      this.transport.emit(REALTIME_CLIENT_EVENTS.subscribe, {
        channel,
        params,
      } satisfies RealtimeSubscriptionPayload<Channel>)
    }

    return () => {
      this.unsubscribe(channel, params)
    }
  }

  unsubscribe<Channel extends RealtimeChannelId>(
    channel: Channel,
    params?: RealtimeChannelParamsMap[Channel],
  ): void {
    const key = buildSubscriptionKey(channel, params)
    const existing = this.subscriptions.get(key)
    if (!existing) {
      return
    }

    existing.count -= 1
    if (existing.count > 0) {
      return
    }

    this.subscriptions.delete(key)

    if (this.transport.isConnected()) {
      this.transport.emit(REALTIME_CLIENT_EVENTS.unsubscribe, {
        channel,
        params,
      } satisfies RealtimeSubscriptionPayload<Channel>)
    }
  }

  publish<TPayload>(event: string, payload: TPayload): void {
    this.connect()
    this.transport.emit(event, payload)
  }

  private resubscribeAll(): void {
    this.subscriptions.forEach((record) => {
      this.transport.emit(REALTIME_CLIENT_EVENTS.subscribe, {
        channel: record.channel,
        params: record.params,
      })
    })
  }
}

export const createRealtimeClient = (config: RealtimeClientConfig) => new SharedRealtimeClient(config)
