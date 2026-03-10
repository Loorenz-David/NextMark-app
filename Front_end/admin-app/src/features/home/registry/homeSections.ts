import { planSectionsMap } from '@/features/plan/'
import { pageRegistry as orderPageRegistry } from '@/features/order/registry/orderSection.registry'
import { pageRegistry as orderCasePageRegistry } from '@/features/orderCase/registry/pageRegistry'
import { pageRegistry as costumerPageRegistry } from '@/features/costumer/registry/costumerSection.registry'

export const homeSectionRegistry = {
  ...orderPageRegistry,
  ...orderCasePageRegistry,
  ...costumerPageRegistry,
  ...planSectionsMap,
}
