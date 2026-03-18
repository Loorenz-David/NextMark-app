import { apiClient } from '@/lib/api/ApiClient'
import type { ApiResult } from '@/lib/api/types'

export type ClientFormLinkResponse = {
  form_url: string
  expires_at: string
}

/**
 * POST /orders/:orderId/client-form-link
 * Generates (or regenerates) a one-time client form link for the given order.
 * Returns the public URL and its expiry timestamp.
 */
export const generateClientFormLink = async (
  orderId: number,
): Promise<{ form_url: string; expires_at: string }> => {
  const result: ApiResult<ClientFormLinkResponse> = await apiClient.request<ClientFormLinkResponse>({
    path: `/orders/${orderId}/client-form-link`,
    method: 'POST',
  })

  if (!result.data) {
    throw new Error('No data returned from server')
  }

  return result.data
}
