export interface AICommandRequest {
  input: string
  parameters?: Record<string, unknown>
}

export interface LegacyAIToolStep {
  tool: string
  params: Record<string, unknown>
  result: unknown
}

export interface LegacyAIAction {
  id?: string
  type: string
  label: string
  payload?: unknown
  hint?: string
  disabled?: boolean
}

export interface LegacyAIResponse {
  success: boolean
  message: string
  data?: Record<string, unknown> | null
  steps: LegacyAIToolStep[]
  thread_id?: string | null
  actions?: LegacyAIAction[]
}
