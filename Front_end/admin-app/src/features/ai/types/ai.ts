// ---------------------------------------------------------------------------
// V2 Thread-based types (current contract)
// ---------------------------------------------------------------------------

export interface AIAction {
  id?: string
  type: 'navigate' | 'apply_order_filters' | 'copy_text' | 'open_settings'
  label: string
  payload?: Record<string, unknown>
  hint?: string
  disabled?: boolean
}

export interface AIToolTraceEntry {
  id: string
  tool: string
  status: 'success' | 'error'
  summary: string
  params: Record<string, unknown>
  result: Record<string, unknown>
}

export interface AIThreadTurn {
  id: string
  thread_id: string
  role: 'user' | 'assistant' | 'tool'
  content: string
  created_at: string
  tool_name?: string
  tool_params?: Record<string, unknown>
  tool_result?: Record<string, unknown>
  actions?: AIAction[]
  tool_trace?: AIToolTraceEntry[]
  data?: Record<string, unknown>
  status_label?: string
}

export interface AIThreadMessagePayload {
  role: 'assistant'
  content: string
  status_label?: string
  actions: AIAction[]
  tool_trace: AIToolTraceEntry[]
  data?: Record<string, unknown> | null
}

export interface AIThreadMessageResponse {
  thread_id: string
  message: AIThreadMessagePayload
}

export interface AIThreadGetResponse {
  thread_id: string
  messages: AIThreadTurn[]
}

export interface AICreateThreadRequest {
  context?: { route?: string }
}

export interface AIMessageRequest {
  message: string
  context?: Record<string, unknown>
}


