import type { PropsWithChildren } from 'react'
import { useMemo } from 'react'

import { usePopupManager, useSectionManager } from '@/shared/resource-manager/useResourceManager'

import { WarehouseContext } from './WarehouseContext'

export const WarehouseProvider = ({ children }: PropsWithChildren) => {
  const sectionManager = useSectionManager()
  const popupManager = usePopupManager()

  const value = useMemo(
    () => ({ sectionManager, popupManager }),
    [popupManager, sectionManager],
  )

  return <WarehouseContext.Provider value={value}>{children}</WarehouseContext.Provider>
}
