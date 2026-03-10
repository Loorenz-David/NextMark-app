import { useEffect } from 'react'

import { useLocalDeliveryOverviewFlow } from '@/features/plan/planTypes/localDelivery/flows/localDeliveryOverview.flow'

export const useLocalDeliveryBootstrapFlow = (planId: number) => {
  const { fetchLocalDeliveryOverview } = useLocalDeliveryOverviewFlow()

  useEffect(() => {
    if (planId == null) return
    fetchLocalDeliveryOverview(planId)
  }, [fetchLocalDeliveryOverview, planId])
}
