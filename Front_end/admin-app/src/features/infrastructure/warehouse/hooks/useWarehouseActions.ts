import { useCallback } from 'react'

import { usePopupManager } from '@/shared/resource-manager/useResourceManager'

import type { WarehouseFormPayload } from '../popups/WarehouseForm/WarehouseForm.types'

export const useWarehouseActions = () => {
  const popupManager = usePopupManager()

  const openWarehouseForm = useCallback((payload: WarehouseFormPayload) => {
    popupManager.open({ key: 'warehouse.form', payload })
  }, [popupManager])

  return {
    openWarehouseForm,
  }
}
