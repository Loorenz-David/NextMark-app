import type{  SVGProps, ComponentType  } from 'react'
import { planIconTypeMap } from '../../utils/planIconTypeMap'

export type PlanTypeOptions = {
  value: 'local_delivery' | 'international_shipping' | 'store_pickup'
  label: string
  icon?: ComponentType<SVGProps<SVGSVGElement>>
}


export const planTypeOptions: PlanTypeOptions[] = [
  { value: 'local_delivery', label: 'Local Delivery', icon: planIconTypeMap['local_delivery'] },
  { value: 'international_shipping', label: 'International Shipping', icon: planIconTypeMap['international_shipping']  },
  { value: 'store_pickup', label: 'Store Pickup', icon: planIconTypeMap['store_pickup']  },
]
