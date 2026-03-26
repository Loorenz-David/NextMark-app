import type { SVGProps, ComponentType } from 'react'

import type { PlanTypeKey } from '@/features/plan/types/plan'
import { InternationalIcon, StoreIcon, RouteIcon } from '@/assets/icons/index'

export const planIconTypeMap: Record<PlanTypeKey, ComponentType<SVGProps<SVGSVGElement>>> = {
  local_delivery: RouteIcon,
  international_shipping: InternationalIcon,
  store_pickup: StoreIcon,
}
