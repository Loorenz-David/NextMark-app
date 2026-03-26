import { useMemo } from 'react'
import type { PlanTypeKey } from '@/features/plan/types/plan'
import { usePlanOrderDndController } from '@/features/local-delivery-orders/dnd/usePlanOrderDndController'

export const usePlanTypeDndController = (planType: PlanTypeKey | null) => {
  // Currently, only local-delivery has a DND controller implemented
  // As other plan types develop their DND logic, add them here
  
  const localDeliveryDnd = usePlanOrderDndController()

  return useMemo(() => {
    switch (planType) {
      case 'local_delivery':
        return localDeliveryDnd
      case 'international_shipping':
        // TODO: Implement international shipping DND controller
        return null
      case 'store_pickup':
        // TODO: Implement store pickup DND controller
        return null
      default:
        return null
    }
  }, [planType, localDeliveryDnd])
}
