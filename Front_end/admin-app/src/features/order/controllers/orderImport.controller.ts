import { useCallback, useState } from 'react'

import { ApiError } from '@/lib/api/ApiClient'
import { useMessageHandler } from '@/shared/message-handler'
import { useLocalDeliveryOverviewFlow } from '@/features/plan/planTypes/localDelivery/flows/localDeliveryOverview.flow'

import { useUploadOrderCsv } from '../api/orderImport.api'

export const useOrderImport = (planId?: number | null) => {
  const uploadOrderCsv = useUploadOrderCsv()
  const { fetchLocalDeliveryOverview } = useLocalDeliveryOverviewFlow()
  const { showMessage } = useMessageHandler()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const uploadCsv = useCallback(
    async (file: File): Promise<boolean> => {
      if (loading) return false

      if (typeof planId !== 'number') {
        const message = 'Delivery plan id is required to import orders.'
        setError(message)
        showMessage({ status: 400, message })
        return false
      }

      setLoading(true)
      setError(null)

      try {
        await uploadOrderCsv(file, planId)
        await fetchLocalDeliveryOverview(planId)
        showMessage({ status: 200, message: 'Orders imported successfully.' })
        return true
      } catch (err) {
        const message = err instanceof ApiError ? err.message : 'Unable to import orders.'
        const status = err instanceof ApiError ? err.status : 500
        setError(message)
        showMessage({ status, message })
        return false
      } finally {
        setLoading(false)
      }
    },
    [fetchLocalDeliveryOverview, loading, planId, showMessage, uploadOrderCsv],
  )

  return {
    uploadCsv,
    loading,
    error,
  }
}
