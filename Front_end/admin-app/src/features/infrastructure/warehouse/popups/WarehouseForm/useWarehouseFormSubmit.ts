import { useCallback } from 'react'

import { useMessageHandler } from '@/shared/message-handler'
import { getObjectDiff } from '@shared-utils'
import { hasFormChanges } from '@shared-domain'
import { buildClientId } from '@/lib/utils/clientId'

import { useCreateWarehouse, useUpdateWarehouse } from '../../api/warehouseApi'
import { useWarehouseByClientId } from '../../hooks/useWarehouseSelectors'
import { useWarehousePopupController } from '../../hooks/useWarehousePopupController'
import { upsertWarehouse } from '../../store/warehouseStore'
import type { WarehouseInput, WarehouseUpdatePayload } from '../../types/warehouse'

import type { WarehouseFormPayload, WarehouseFormState } from './WarehouseForm.types'

export const useWarehouseFormSubmit = ({
  payload,
  formState,
  validateForm,
  initialFormRef,
}: {
  payload: WarehouseFormPayload
  formState: WarehouseFormState
  validateForm: () => boolean
  initialFormRef: React.RefObject<WarehouseFormState | null>
}) => {
  const { showMessage } = useMessageHandler()
  const createWarehouse = useCreateWarehouse()
  const updateWarehouse = useUpdateWarehouse()
  const existing = useWarehouseByClientId(payload.clientId ?? null)
  const { closeWarehouseForm } = useWarehousePopupController()

  const handleSave = useCallback(async () => {
    if (!validateForm()) {
      showMessage({ status: 400, message: 'Please fix the highlighted fields.' })
      return
    }

    if (!hasFormChanges(formState, initialFormRef)) {
      showMessage({ status: 400, message: 'No changes to save.' })
      return
    }

    const initialForm = initialFormRef.current
    if (!initialForm) {
      showMessage({ status: 400, message: 'Missing initial form snapshot.' })
      return
    }

    const diff = getObjectDiff(initialForm, formState)
    const basePayload: WarehouseInput = {
      client_id: existing?.client_id ?? buildClientId('warehouse'),
      name: diff.name ?? formState.name,
      property_location: diff.property_location ?? formState.property_location,
    }

    try {
      if (payload.mode === 'create') {
        await createWarehouse(basePayload)
        upsertWarehouse({ ...basePayload })
      } else if (existing?.id) {
        const updatePayload: WarehouseUpdatePayload = {
          target_id: existing.id,
          fields: basePayload,
        }
        await updateWarehouse(updatePayload)
        upsertWarehouse({ ...existing, ...basePayload })
      }
      closeWarehouseForm()
    } catch (error) {
      console.error('Failed to save warehouse', error)
      showMessage({ status: 500, message: 'Unable to save warehouse.' })
    }
  }, [
    closeWarehouseForm,
    createWarehouse,
    existing,
    formState,
    initialFormRef,
    payload.mode,
    showMessage,
    updateWarehouse,
    validateForm,
  ])

  return { handleSave }
}
