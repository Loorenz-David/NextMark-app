import { io, type Socket } from 'socket.io-client'

type TransportHandler = (payload: unknown) => void
type ConnectionHandler = (connected: boolean) => void

type EnsureConnectionOptions = {
  socketUrl: string
  token: string
}

export class SocketIoTransport {
  private socket: Socket | null = null
  private socketUrl: string | null = null
  private token: string | null = null
  private eventHandlers = new Map<string, Set<TransportHandler>>()
  private connectionHandlers = new Set<ConnectionHandler>()

  ensureConnection({ socketUrl, token }: EnsureConnectionOptions): void {
    const requiresRebuild = !this.socket || this.socketUrl !== socketUrl || this.token !== token

    if (requiresRebuild) {
      this.rebuildSocket({ socketUrl, token })
    }

    if (this.socket && !this.socket.connected && !this.socket.active) {
      this.socket.connect()
    }
  }

  disconnect(): void {
    if (!this.socket) {
      return
    }

    this.socket.removeAllListeners()
    this.socket.disconnect()
    this.socket = null
    this.socketUrl = null
    this.token = null
    this.emitConnectionChange(false)
  }

  isConnected(): boolean {
    return Boolean(this.socket?.connected)
  }

  emit(event: string, payload?: unknown): void {
    this.socket?.emit(event, payload)
  }

  on(event: string, handler: TransportHandler): () => void {
    const handlers = this.eventHandlers.get(event) ?? new Set<TransportHandler>()
    handlers.add(handler)
    this.eventHandlers.set(event, handlers)
    this.socket?.on(event, handler)

    return () => {
      const current = this.eventHandlers.get(event)
      if (!current) {
        return
      }

      current.delete(handler)
      this.socket?.off(event, handler)

      if (current.size === 0) {
        this.eventHandlers.delete(event)
      }
    }
  }

  onConnectionChange(handler: ConnectionHandler): () => void {
    this.connectionHandlers.add(handler)
    handler(this.isConnected())

    return () => {
      this.connectionHandlers.delete(handler)
    }
  }

  private rebuildSocket({ socketUrl, token }: EnsureConnectionOptions): void {
    if (this.socket) {
      this.socket.removeAllListeners()
      this.socket.disconnect()
    }

    const nextSocket = io(socketUrl, {
      transports: ['websocket'],
      autoConnect: false,
      withCredentials: true,
      path: '/socket.io',
      extraHeaders: { Authorization: `Bearer ${token}` },
      auth: { token },
      query: { token },
    })

    this.socket = nextSocket
    this.socketUrl = socketUrl
    this.token = token

    nextSocket.on('connect', () => {
      this.emitConnectionChange(true)
    })
    nextSocket.on('disconnect', () => {
      this.emitConnectionChange(false)
    })
    nextSocket.on('connect_error', () => {
      this.emitConnectionChange(false)
    })

    this.eventHandlers.forEach((handlers, event) => {
      handlers.forEach((handler) => {
        nextSocket.on(event, handler)
      })
    })
  }

  private emitConnectionChange(connected: boolean): void {
    this.connectionHandlers.forEach((handler) => {
      handler(connected)
    })
  }
}
