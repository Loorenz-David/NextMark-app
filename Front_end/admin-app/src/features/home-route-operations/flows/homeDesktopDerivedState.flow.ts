import { useMemo } from 'react'

import { useStackActionEntries } from '@/shared/stack-manager/useStackActionEntries'
import type { StackActionManager } from '@/shared/stack-manager/StackActionManager'
import type { BaseControls } from '@/shared/resource-manager/types'
import type { PayloadBase } from '../types/types'
import { LocalDeliveryPage } from '@/features/local-delivery-orders'
import { InternationalShippingOrdersPage } from '@/features/international-shipping-orders'
import { StorePickupOrdersPage } from '@/features/store-pickup-orders'
import type { PlanTypeKey } from '@/features/plan/types/plan'
import type { ComponentType } from 'react'

type HomeBaseControls = BaseControls<PayloadBase>

const planTypePageMap: Record<PlanTypeKey, ComponentType<any>> = {
  local_delivery: LocalDeliveryPage,
  international_shipping: InternationalShippingOrdersPage,
  store_pickup: StorePickupOrdersPage,
}

export const useHomeDesktopDerivedStateFlow = ({
  sectionManager,
  baseControlls,
}: {
  sectionManager: StackActionManager<Record<string, unknown>>
  baseControlls: HomeBaseControls
}) => {
  const sectionEntries = useStackActionEntries(sectionManager)

  return useMemo(() => {
    const openSectionsCount = sectionEntries.filter((entry) => !entry.isClosing).length
    const ordersPlanType = baseControlls.payload?.ordersPlanType ?? null
    const isLocalDeliveryOverlayActive =
      baseControlls.isBaseOpen && ordersPlanType === 'local_delivery'
    const SelectedOrdersPlanType = ordersPlanType ? planTypePageMap[ordersPlanType] : null

    return {
      openSectionsCount,
      ordersPlanType,
      isLocalDeliveryOverlayActive,
      SelectedOrdersPlanType,
    }
  }, [baseControlls.isBaseOpen, baseControlls.payload?.ordersPlanType, sectionEntries])
}
