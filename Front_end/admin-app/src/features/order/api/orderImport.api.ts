import { apiClient } from '@/lib/api/ApiClient'
import type { ApiResult } from '@/lib/api/types'

export const uploadOrderCsv = (
  file: File,
  deliveryPlanId?: number,
): Promise<ApiResult<Record<string, never>>> => {
  const formData = new FormData()
  formData.append('file', file)

  return apiClient.request<Record<string, never>>({
    path: '/orders/import',
    method: 'PUT',
    query: deliveryPlanId != null ? { delivery_plan_id: deliveryPlanId } : undefined,
    data: formData,
  })
}

export const useUploadOrderCsv = () => uploadOrderCsv
