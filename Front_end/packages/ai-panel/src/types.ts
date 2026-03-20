import type { ReactNode } from 'react'

export type AiMessageRole = 'user' | 'assistant' | 'status' | 'error'

export type AiActionVariant = 'primary' | 'secondary' | 'ghost'

export interface AiActionDescriptor<TPayload = unknown> {
  id?: string
  type: string
  label: string
  payload?: TPayload
  hint?: string
  disabled?: boolean
  loading?: boolean
  variant?: AiActionVariant
}

export type AiToolTraceStatus = 'success' | 'error' | 'info'

export interface AiToolTraceEntry {
  id?: string
  tool: string
  status?: AiToolTraceStatus
  summary?: string
  params?: Record<string, unknown>
  result?: unknown
}

export interface AiPanelMessage {
  id: string
  role: AiMessageRole
  content: string
  createdAt: number
  statusLabel?: string
  actions?: AiActionDescriptor[]
  toolTrace?: AiToolTraceEntry[]
  data?: unknown
}

export interface AiThreadState {
  threadId: string
  messages: AiPanelMessage[]
}

export interface AiPanelResponse {
  threadId: string
  message: {
    role?: Extract<AiMessageRole, 'assistant' | 'status' | 'error'>
    content: string
    statusLabel?: string
    actions?: AiActionDescriptor[]
    toolTrace?: AiToolTraceEntry[]
    data?: unknown
  }
}

export interface AiTransportAdapter {
  createThread: () => Promise<{ threadId: string }>
  sendMessage: (request: { threadId: string; message: string; context?: unknown }) => Promise<AiPanelResponse>
  loadThread?: (threadId: string) => Promise<AiThreadState>
}

export type AiActionHandler = (action: AiActionDescriptor) => void | Promise<void>

export interface AiPanelTheme {
  accent: string
  background: string
  surface: string
  surfaceAlt: string
  text: string
  muted: string
  border: string
  shadow: string
  launcherAccent: string
  fontFamily?: string
}

export interface AiPanelConfig {
  title?: string
  subtitle?: string
  placeholder?: string
  storageKey?: string
  mobileBreakpoint?: number
  viewportMargin?: number
  defaultOpen?: boolean
  desktopSize?: {
    width: number
    height: number
  }
  launcherLabel?: string
  theme?: Partial<AiPanelTheme>
  renderEmptyState?: ReactNode
}

export interface AiPanelProviderProps extends AiPanelConfig {
  children: ReactNode
  transport: AiTransportAdapter
  resolveAction?: AiActionHandler
}

export interface AiPanelController {
  isOpen: boolean
  isLoading: boolean
  threadId: string | null
  messages: AiPanelMessage[]
  open: () => void
  close: () => void
  toggle: () => void
  clearConversation: () => void
  retryLast: () => Promise<void>
  send: (message?: string, context?: unknown) => Promise<void>
}

export interface AiPanelLauncherProps {
  label?: string
}
