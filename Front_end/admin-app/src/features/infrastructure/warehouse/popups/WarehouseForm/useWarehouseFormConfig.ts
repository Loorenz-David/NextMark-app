import type { RefObject } from 'react'
import { useEffect } from 'react'

import { hasFormChanges } from '@shared-domain'
import { usePopupContext } from '@/shared/popups/MainPopup/PopupContext'

import type { WarehouseFormPayload, WarehouseFormState } from './WarehouseForm.types'

export const useWarehouseFormConfig = ({
  formState,
  initialFormRef,
  payload,
}: {
  formState: WarehouseFormState
  initialFormRef: RefObject<WarehouseFormState | null>
  payload: WarehouseFormPayload
}) => {
  const { setPopupHeader, registerCloseGuard, clearCloseGuard } = usePopupContext()

  useEffect(() => {
    setPopupHeader({ label: payload.mode === 'create' ? 'Create warehouse' : 'Edit warehouse' })
    return () => setPopupHeader(null)
  }, [payload.mode, setPopupHeader])

  useEffect(() => {
    registerCloseGuard(() => !hasFormChanges(formState, initialFormRef))
    return () => clearCloseGuard()
  }, [formState, initialFormRef])
}
