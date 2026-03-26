import type { ComponentType } from 'react'

import type { PlanTypeKey } from '@/features/plan/types/plan'
import { LocalDeliveryPage } from '@/features/plan/planTypes/localDelivery/pages/LocalDelivery.page'
import { InternationalShippingPage } from '@/features/plan/planTypes/internationalShipping/pages/InternationalShipping.page'
import { StorePickupPage } from '@/features/plan/planTypes/storePickup/pages/StorePickup.page'

export const planSectionTypeMap: Record<PlanTypeKey, string> = {
  local_delivery: 'LocalDeliveryPage',
  international_shipping: 'InternationalShippingPage',
  store_pickup: 'StorePickupPage',
}

export const PlanSectionTypesMap: Record<PlanTypeKey, ComponentType<any>> = {
  local_delivery: LocalDeliveryPage,
  international_shipping: InternationalShippingPage,
  store_pickup: StorePickupPage,
}
