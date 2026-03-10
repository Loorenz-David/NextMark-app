import { PlanPage } from '../pages/Plan.page'
import { LocalDeliveryPage } from '../planTypes/localDelivery/pages/LocalDelivery.page'
import { LocalDeliveryStatsPage } from '../planTypes/localDelivery/pages/LocalDeliveryStats.page'
import { InternationalShippingPage } from '../planTypes/internationalShipping/pages/InternationalShipping.page'
import { StorePickupPage } from '../planTypes/storePickup/pages/StorePickup.page'

export const planSectionsRegistry = {
    PlanPage,
    LocalDeliveryPage,
    LocalDeliveryStatsPage,
    InternationalShippingPage,
    StorePickupPage,
}
