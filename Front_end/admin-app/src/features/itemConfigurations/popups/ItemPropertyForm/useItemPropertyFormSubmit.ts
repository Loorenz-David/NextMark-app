import { useCallback } from 'react'

import { useMessageHandler } from '@/shared/message-handler'
import { getObjectDiff } from '@/shared/utils/getObjectDiff'
import { hasFormChanges } from '@/shared/data-validation/compareChanges'
import { buildClientId } from '@/lib/utils/clientId'

import { useCreateItemProperty, useUpdateItemProperty } from '../../api/itemPropertyApi'
import { useItemPropertyByClientId } from '../../hooks/useItemSelectors'
import { useItemPopupController } from '../../hooks/useItemPopupController'
import { upsertItemProperty } from '../../store/itemPropertyStore'
import type { ItemPropertyPayload } from '../../types/itemProperty'

import type { ItemPropertyFormPayload, ItemPropertyFormState } from './ItemPropertyForm.types'


export const useItemPropertyFormSubmit = ({
  payload,
  formState,
  validateForm,
  initialFormRef,
}: {
  payload: ItemPropertyFormPayload
  formState: ItemPropertyFormState
  validateForm: () => boolean
  initialFormRef: React.RefObject<ItemPropertyFormState | null>
}) => {
  const { showMessage } = useMessageHandler()
  const createItemProperty = useCreateItemProperty()
  const updateItemProperty = useUpdateItemProperty()
  const existing = useItemPropertyByClientId(payload.clientId ?? null)
  const { closePropertyForm } = useItemPopupController()

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
    const createPayload: ItemPropertyPayload = {
      client_id: existing?.client_id ?? buildClientId('item_property'),
      name: formState.name,
      field_type: formState.field_type,
      options: formState.options,
      required: formState.required,
      item_types: formState.item_types,
    }

    try {
      if (payload.mode === 'create') {
        await createItemProperty(createPayload)
        upsertItemProperty({ ...createPayload })
      } else if (existing?.id) {
        await updateItemProperty(existing.id, diff)
        const nextItem = {
          ...existing,
          ...diff,
          item_types: diff.item_types ?? formState.item_types,
        }
        upsertItemProperty(nextItem)
      }
      closePropertyForm()
    } catch (error) {
      console.error('Failed to save item property', error)
      showMessage({ status: 500, message: 'Unable to save item property.' })
    }
  }, [
    closePropertyForm,
    createItemProperty,
    existing,
    formState,
    initialFormRef,
    payload.mode,
    showMessage,
    updateItemProperty,
    validateForm,
  ])

  return { handleSave }
}
