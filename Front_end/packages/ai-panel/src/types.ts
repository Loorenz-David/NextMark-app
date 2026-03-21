import type { ReactNode } from 'react'

export type AiMessageRole = 'user' | 'assistant' | 'status' | 'error'

/**
 * Base context shape sent alongside user messages.
 * Host applications may extend this with app-specific fields.
 *
 * @example
 * type AdminContext = AiMessageContext & { app_scope: 'admin'; userId: string }
 */
export interface AiMessageContext {
  /** The frontend route active when the message is sent. */
  route?: string
  [key: string]: unknown
}

export type AiActionVariant = 'primary' | 'secondary' | 'ghost'

export type AiBlockKind = 'entity_detail' | 'entity_collection' | 'summary' | 'stat'

export type AiBlockEntityType = 'order' | 'route' | 'plan' | 'client' | 'driver' | 'generic'

export type AiBlockLayout = 'card' | 'cards' | 'list' | 'table' | 'chips' | 'key_value'

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

export type AiInteractionKind = 'ui_action' | 'continue_prompt' | 'question' | 'confirm'

export type AiInteractionResponseMode = 'text' | 'select' | 'confirm' | 'form'

export type AiInteractionFieldType =
  | 'text'
  | 'textarea'
  | 'phone'
  | 'email'
  | 'number'
  | 'date'
  | 'datetime'
  | 'select'
  | 'boolean'

export type AiInteractionValidationPattern = 'phone' | 'email' | 'postal_code'

export interface AiInteractionOption {
  id: string
  label: string
}

export interface AiInteractionFieldValidation {
  pattern?: AiInteractionValidationPattern
  min?: number
  max?: number
  max_length?: number
}

export interface AiInteractionField {
  id: string
  label: string
  type: AiInteractionFieldType
  required?: boolean
  placeholder?: string
  help_text?: string
  default_value?: string | number | boolean | null
  options?: AiInteractionOption[]
  suggestions?: AiInteractionOption[]
  validation?: AiInteractionFieldValidation
}

export interface AIInteraction<TPayload = unknown> {
  id?: string
  kind: AiInteractionKind
  label: string
  payload?: TPayload
  hint?: string
  required?: boolean
  disabled?: boolean
  response_mode?: AiInteractionResponseMode
  options?: AiInteractionOption[]
  fields?: AiInteractionField[]
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

export interface AiMessageBlock {
  id?: string
  kind: AiBlockKind
  entityType?: AiBlockEntityType
  layout?: AiBlockLayout
  title?: string
  subtitle?: string
  data: unknown
  actions?: AiActionDescriptor[]
  meta?: Record<string, unknown>
  interactions?: AIInteraction[]
}

export interface AiBlockRendererProps {
  block: AiMessageBlock
  message: AiPanelMessage
  theme: AiPanelTheme
  activeActionId: string | null
  onAction: (action: AiActionDescriptor) => Promise<void>
}

export interface AiPanelMessage {
  id: string
  role: AiMessageRole
  content: string
  createdAt: number
  statusLabel?: string
  blocks?: AiMessageBlock[]
  actions?: AiActionDescriptor[]
  toolTrace?: AiToolTraceEntry[]
  data?: unknown
  interactions?: AIInteraction[]
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
    blocks?: AiMessageBlock[]
    actions?: AiActionDescriptor[]
    toolTrace?: AiToolTraceEntry[]
    data?: unknown
    interactions?: AIInteraction[]
  }
}

export interface AiTransportAdapter {
  createThread: () => Promise<{ threadId: string }>
  sendMessage: (request: {
    threadId: string
    message: string
    context?: AiMessageContext
    __interaction_response__?: string
    confirm_accepted?: boolean
    interaction_form?: Record<string, unknown>
  }) => Promise<AiPanelResponse>
  loadThread?: (threadId: string) => Promise<AiThreadState>
  pollLoadingStatus?: (request: {
    threadId: string
    lastMessage?: string
  }) => Promise<{
    message?: string
  }>
}

export type AiActionHandler = (action: AiActionDescriptor) => void | Promise<void>

export type AiLegacyDataToBlocksMapper = (data: unknown) => AiMessageBlock[] | null

export type AiBlockRenderer = (props: AiBlockRendererProps) => ReactNode | null

export interface AiPanelTheme {
  accent: string
  background: string
  surface: string
  surfaceAlt: string
  text: string
  muted: string
  border: string
  shadow: string
  fontFamily?: string
  composer: {
    background: string
    border: string
    text: string
    placeholderText: string
    shadow: string
    fontFamily?: string
    muted?: string
    accent?: string
  }
  launcher:{
    launcherAccent: string
    border: string
    text: string
    fontSize: number
    fontWeight: number
    shadow: string
    background: string
    fontFamily?: string
    accent?: string
  }
  header: {
    backgroundColor: string
    border: string
    text: string
    placeholderText: string
    shadow: string
    fontFamily?: string
    muted?: string
    accent?: string 
  }
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
  mapLegacyDataToBlocks?: AiLegacyDataToBlocksMapper
  renderBlock?: AiBlockRenderer
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
  send: (message?: string, context?: AiMessageContext) => Promise<void>
}

export interface AiPanelLauncherProps {
  label?: string
}
