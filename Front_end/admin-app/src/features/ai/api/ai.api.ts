import { apiClient } from '@/lib/api/ApiClient'
import type { AICommandRequest, LegacyAIResponse } from '../types/ai'

export const aiApi = {
  sendCommand: async (payload: AICommandRequest): Promise<LegacyAIResponse> => {
    const response = await apiClient.request<LegacyAIResponse>({
      path: '/ai/command',
      method: 'POST',
      data: payload,
    })

    return response.data
  },
}
