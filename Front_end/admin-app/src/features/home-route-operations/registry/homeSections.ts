import { LocalDeliveryPage } from '@/features/local-delivery-orders'
import { InternationalShippingOrdersPage } from '@/features/international-shipping-orders'
import { StorePickupOrdersPage } from '@/features/store-pickup-orders'
import { pageRegistry as orderPageRegistry } from '@/features/order/registry/orderSection.registry'
import { pageRegistry as orderCasePageRegistry } from '@/features/orderCase/registry/pageRegistry'
import { pageRegistry as costumerPageRegistry } from '@/features/costumer/registry/costumerSection.registry'
import { PlanPage } from '@/features/plan/pages/Plan.page'

// Map plan types to their corresponding page components
const planOrdersRegistry = {
  LocalDeliveryPage,
  InternationalShippingOrdersPage,
  StorePickupOrdersPage,
}

// Map plan type keys to page component names for routing
const planTypeToPageMap = {
  local_delivery: 'LocalDeliveryPage',
  international_shipping: 'InternationalShippingOrdersPage',
  store_pickup: 'StorePickupOrdersPage',
}

export const homeSectionRegistry = {
  ...orderPageRegistry,
  ...orderCasePageRegistry,
  ...costumerPageRegistry,
  PlanPage, // Plan listing page
  ...planOrdersRegistry, // Plan type pages
}
