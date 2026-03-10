import { createContext } from 'react'

import type { StackActionManager } from '@/shared/stack-manager/StackActionManager'

export type WarehouseContextValue = {
  sectionManager: StackActionManager<Record<string, unknown>>
  popupManager: StackActionManager<Record<string, unknown>>
}

export const WarehouseContext = createContext<WarehouseContextValue | null>(null)
