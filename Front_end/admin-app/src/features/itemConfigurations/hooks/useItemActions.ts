import { useCallback } from 'react'

import { usePopupManager } from '@/shared/resource-manager/useResourceManager'

export const useItemActions = () => {
  const popupManager = usePopupManager()

  const openTypeForm = useCallback(
    (mode: 'create' | 'edit', clientId?: string) => {
      popupManager.open({ key: 'item.type.form', payload: { mode, clientId } })
    },
    [popupManager],
  )

  const openPropertyForm = useCallback(
    (mode: 'create' | 'edit', clientId?: string) => {
      popupManager.open({ key: 'item.property.form', payload: { mode, clientId } })
    },
    [popupManager],
  )

  const openPositionForm = useCallback(
    (mode: 'create' | 'edit', clientId?: string) => {
      popupManager.open({ key: 'item.position.form', payload: { mode, clientId } })
    },
    [popupManager],
  )

  const openStateForm = useCallback(
    (mode: 'create' | 'edit', clientId?: string) => {
      popupManager.open({ key: 'item.state.form', payload: { mode, clientId } })
    },
    [popupManager],
  )

  return {
    openTypeForm,
    openPropertyForm,
    openPositionForm,
    openStateForm,
  }
}
