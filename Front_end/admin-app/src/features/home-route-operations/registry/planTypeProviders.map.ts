import type { ComponentType, ReactNode } from 'react'
import type { PlanTypeKey } from '@/features/plan/types/plan'
import { LocalDeliveryProvider } from '@/features/local-delivery-orders/context/LocalDelivery.provider'
import { InternationalShippingOrdersProvider } from '@/features/international-shipping-orders/context/InternationalShippingOrders.provider'
import { StorePickupOrdersProvider } from '@/features/store-pickup-orders/context/StorePickupOrders.provider'

type PlanTypeProviderMapType = {
  [K in PlanTypeKey]: {
    component: ComponentType<{ planId: number; children: ReactNode }>
    key: string
  }
}

export const planTypeProviderMap: PlanTypeProviderMapType = {
  local_delivery: {
    component: LocalDeliveryProvider,
    key: 'local-delivery-provider',
  },
  international_shipping: {
    component: InternationalShippingOrdersProvider,
    key: 'international-shipping-provider',
  },
  store_pickup: {
    component: StorePickupOrdersProvider,
    key: 'store-pickup-provider',
  },
}

export const getPlanTypeProvider = (planType: PlanTypeKey | null): ComponentType<{ planId: number; children: ReactNode }> | null => {
  if (!planType) return null
  return planTypeProviderMap[planType]?.component ?? null
}
