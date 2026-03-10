import type { ComponentType, SVGProps } from 'react'
import type { PlanTypeKey } from '@/features/plan/types/plan'
import { LocalDeliveryPage } from '../planTypes/localDelivery/pages/LocalDelivery.page'
import { InternationalShippingPage } from '../planTypes/internationalShipping/pages/InternationalShipping.page'
import { StorePickupPage } from '../planTypes/storePickup/pages/StorePickup.page'
import { InternationalIcon, StoreIcon, RouteIcon} from '@/assets/icons/index'

export const planSectionTypeMap: Record<PlanTypeKey, string> = {
  local_delivery: 'LocalDeliveryPage',
  international_shipping: 'InternationalShippingPage',
  store_pickup: 'StorePickupPage',
}

export const planSectionsMap: Record<PlanTypeKey, ComponentType<any>> = {
  local_delivery: LocalDeliveryPage,
  international_shipping: InternationalShippingPage,
  store_pickup: StorePickupPage,
}



export const planSectionIconsMap: Record<PlanTypeKey, ComponentType<SVGProps<SVGSVGElement>>> = {
    'local_delivery': RouteIcon,
    'international_shipping':InternationalIcon,
    'store_pickup':StoreIcon,
}