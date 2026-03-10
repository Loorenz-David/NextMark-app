import { useMemo } from 'react'

import { planSectionsMap } from '@/features/plan'
import { useStackActionEntries } from '@/shared/stack-manager/useStackActionEntries'
import type { StackActionManager } from '@/shared/stack-manager/StackActionManager'
import type { BaseControls } from '@/shared/resource-manager/types'
import type { PayloadBase } from '../types/types'

type HomeBaseControls = BaseControls<PayloadBase>

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
    const SelectedOrdersPlanType = ordersPlanType ? planSectionsMap[ordersPlanType] : null

    return {
      openSectionsCount,
      ordersPlanType,
      isLocalDeliveryOverlayActive,
      SelectedOrdersPlanType,
    }
  }, [baseControlls.isBaseOpen, baseControlls.payload?.ordersPlanType,, sectionEntries])
}
