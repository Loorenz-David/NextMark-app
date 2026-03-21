import type {
  AiActionDescriptor,
  AiPanelMessage,
  AiPanelResponse,
  AiThreadState,
  AiToolTraceEntry,
  AiTransportAdapter,
} from '@nextmark/ai-panel'

import { aiApi } from '../api/ai.api'
import type { AIAction, AIThreadMessageResponse, AIToolTraceEntry } from '../types/ai'

// ---------------------------------------------------------------------------
// V2 normalizers
// ---------------------------------------------------------------------------

function normalizeV2Action(action: AIAction): AiActionDescriptor {
  return {
    id: action.id,
    type: action.type,
    label: action.label,
    payload: action.payload,
    hint: action.hint,
    disabled: action.disabled,
  }
}

function normalizeV2ToolTrace(entry: AIToolTraceEntry): AiToolTraceEntry {
  return {
    id: entry.id,
    tool: entry.tool,
    status: entry.status,
    summary: entry.summary,
    params: entry.params,
    result: entry.result,
  }
}

export function normalizeV2Response(response: AIThreadMessageResponse): AiPanelResponse {
  const msg = response.message
  return {
    threadId: response.thread_id,
    message: {
      role: msg.role,
      content: msg.content || 'Done.',
      statusLabel: msg.status_label ?? 'Completed',
      actions: (msg.actions ?? []).map(normalizeV2Action),
      toolTrace: (msg.tool_trace ?? []).map(normalizeV2ToolTrace),
      data: msg.data ?? null,
    },
  }
}

// ---------------------------------------------------------------------------
// Transport adapter — uses V2 backend thread API
// ---------------------------------------------------------------------------

export const adminAiPanelTransport: AiTransportAdapter = {
  createThread: async () => {
    const result = await aiApi.createThread()
    return { threadId: result.thread_id }
  },

  sendMessage: async ({ threadId, message, context }) => {
    const response = await aiApi.sendMessage(threadId, { message, context })
    return normalizeV2Response(response)
  },

  loadThread: async (threadId: string): Promise<AiThreadState> => {
    const result = await aiApi.getThread(threadId)
    const messages: AiPanelMessage[] = result.messages
      .filter((t) => t.role === 'user' || t.role === 'assistant')
      .map((turn) => ({
        id: turn.id,
        role: turn.role as 'user' | 'assistant',
        content: turn.content,
        createdAt: new Date(turn.created_at).getTime(),
        statusLabel: turn.status_label,
        actions: turn.actions?.map(normalizeV2Action),
        toolTrace: turn.tool_trace?.map(normalizeV2ToolTrace),
        data: turn.data,
      }))
    return { threadId: result.thread_id, messages }
  },
}
