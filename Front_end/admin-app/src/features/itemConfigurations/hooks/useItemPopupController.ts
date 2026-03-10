import { useCallback } from 'react'

import { usePopupManager } from '@/shared/resource-manager/useResourceManager'

export const useItemPopupController = () => {
  const popupManager = usePopupManager()

  const closeTypeForm = useCallback(() => {
    popupManager.closeByKey('item.type.form')
  }, [popupManager])

  const closePropertyForm = useCallback(() => {
    popupManager.closeByKey('item.property.form')
  }, [popupManager])

  const closePositionForm = useCallback(() => {
    popupManager.closeByKey('item.position.form')
  }, [popupManager])

  const closeStateForm = useCallback(() => {
    popupManager.closeByKey('item.state.form')
  }, [popupManager])

  return {
    closeTypeForm,
    closePropertyForm,
    closePositionForm,
    closeStateForm,
  }
}
