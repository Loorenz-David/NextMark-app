import { useCallback, useEffect } from 'react'

import type { BaseControls } from '@/shared/resource-manager/types'
import type { StackActionManager } from '@/shared/stack-manager/StackActionManager'

type BasePayload = { ordersPlanType: string | null; planId?: number | null }

type Params = {
  isMobile: boolean
  baseControls: BaseControls<BasePayload>
  popupManager: StackActionManager<Record<string, unknown>>
  sectionManager: StackActionManager<Record<string, unknown>>
}

export const useLocalDeliveryEscapeFlow = ({
  isMobile,
  baseControls,
  popupManager,
  sectionManager,
}: Params) => {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return

      const isPopupOpen = popupManager.getOpenCount() > 0
      const areSectionsOpen = sectionManager.getOpenCount() > 0
      if (isPopupOpen || areSectionsOpen) return

      baseControls.closeBase()
    },
    [baseControls, popupManager, sectionManager],
  )

  useEffect(() => {
    if (isMobile) return

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [handleKeyDown, isMobile])
}
