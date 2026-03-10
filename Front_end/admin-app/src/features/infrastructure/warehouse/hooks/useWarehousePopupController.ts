import { useCallback } from 'react'

import { usePopupManager } from '@/shared/resource-manager/useResourceManager'

export const useWarehousePopupController = () => {
  const popupManager = usePopupManager()

  const closeWarehouseForm = useCallback(() => {
    popupManager.closeByKey('warehouse.form')
  }, [popupManager])

  return { closeWarehouseForm }
}
