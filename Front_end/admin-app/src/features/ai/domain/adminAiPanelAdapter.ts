import type {
  AiActionDescriptor,
  AiPanelResponse,
  AiToolTraceEntry,
  AiTransportAdapter,
} from '@nextmark/ai-panel'

import { aiApi } from '../api/ai.api'
import type { LegacyAIAction, LegacyAIResponse, LegacyAIToolStep } from '../types/ai'

function buildThreadId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }

  return `thread-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
}

function normalizeAction(action: LegacyAIAction): AiActionDescriptor {
  return {
    id: action.id,
    type: action.type,
    label: action.label,
    payload: action.payload,
    hint: action.hint,
    disabled: action.disabled,
  }
}

function normalizeToolTrace(step: LegacyAIToolStep, index: number): AiToolTraceEntry {
  const hasError =
    typeof step.result === 'object' &&
    step.result !== null &&
    'error' in step.result &&
    typeof (step.result as { error?: unknown }).error === 'string'

  return {
    id: `${step.tool}-${index}`,
    tool: step.tool,
    status: hasError ? 'error' : 'success',
    summary: hasError
      ? String((step.result as { error: string }).error)
      : 'Tool finished successfully.',
    params: step.params,
    result: step.result,
  }
}

export function normalizeAdminAiResponse(
  response: LegacyAIResponse,
  fallbackThreadId: string,
): AiPanelResponse {
  return {
    threadId: response.thread_id?.trim() || fallbackThreadId,
    message: {
      role: response.success ? 'assistant' : 'error',
      content: response.message || (response.success ? 'Done.' : 'The AI request failed.'),
      statusLabel: response.success ? 'Completed' : 'Failed',
      actions: Array.isArray(response.actions) ? response.actions.map(normalizeAction) : [],
      toolTrace: Array.isArray(response.steps) ? response.steps.map(normalizeToolTrace) : [],
      data: response.data ?? null,
    },
  }
}

export const adminAiPanelTransport: AiTransportAdapter = {
  createThread: async () => ({
    threadId: buildThreadId(),
  }),

  sendMessage: async ({ threadId, message, context }) => {
    const response = await aiApi.sendCommand({
      input: message,
      parameters: {
        thread_id: threadId,
        context,
      },
    })

    return normalizeAdminAiResponse(response, threadId)
  },
}
