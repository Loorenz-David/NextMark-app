import { useCallback } from 'react'

import { useMessageHandler } from '@shared-message-handler'
import { getObjectDiff } from '@shared-utils'
import { hasFormChanges } from '@shared-domain'
import { buildClientId } from '@/lib/utils/clientId'

import { useCreateItemType, useUpdateItemType } from '../../api/itemTypeApi'
import { useItemTypeByClientId } from '../../hooks/useItemSelectors'
import { useItemPopupController } from '../../hooks/useItemPopupController'
import { upsertItemType } from '../../store/itemTypeStore'
import type { ItemTypePayload } from '../../types/itemType'

import type { ItemTypeFormPayload, ItemTypeFormState } from './ItemTypeForm.types'


export const useItemTypeFormSubmit = ({
  payload,
  formState,
  validateForm,
  initialFormRef,
}: {
  payload: ItemTypeFormPayload
  formState: ItemTypeFormState
  validateForm: () => boolean
  initialFormRef: React.RefObject<ItemTypeFormState | null>
}) => {
  const { showMessage } = useMessageHandler()
  const createItemType = useCreateItemType()
  const updateItemType = useUpdateItemType()
  const existing = useItemTypeByClientId(payload.clientId ?? null)
  const { closeTypeForm } = useItemPopupController()

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
    const createPayload: ItemTypePayload = {
      client_id: existing?.client_id ?? buildClientId('item_type'),
      name: formState.name,
      properties: formState.properties,
    }

    try {
      if (payload.mode === 'create') {
        await createItemType(createPayload)
        upsertItemType({ ...createPayload })
      } else if (existing?.id) {
        await updateItemType(existing.id, diff)
        const nextItem = {
          ...existing,
          ...diff,
          properties: diff.properties ?? formState.properties,
        }
        upsertItemType(nextItem)
      }
      closeTypeForm()
    } catch (error) {
      console.error('Failed to save item type', error)
      showMessage({ status: 500, message: 'Unable to save item type.' })
    }
  }, [
    closeTypeForm,
    createItemType,
    existing,
    formState,
    initialFormRef,
    payload.mode,
    showMessage,
    updateItemType,
    validateForm,
  ])

  return { handleSave }
}
