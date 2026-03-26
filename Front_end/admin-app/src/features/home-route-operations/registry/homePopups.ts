import { planPopupRegistry } from '@/features/plan/'
import { popupRegistry as orderPopupRegistry } from '@/features/order/registry/orderPopups.registry'
import { costumerPopupRegistry } from '@/features/costumer/registry/costumerPopups.registry'
// import { itemPopupRegistry } from '@/features/item/registry/itemPopups'

export const homePopupRegistry = {
  ...planPopupRegistry,
  ...orderPopupRegistry,
  ...costumerPopupRegistry,
  // ...itemPopupRegistry
}

export const loadingPopupRegistry = {
  
}
