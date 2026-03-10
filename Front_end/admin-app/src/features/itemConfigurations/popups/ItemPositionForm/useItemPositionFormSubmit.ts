import { useCallback } from 'react'

import { useMessageHandler } from '@/shared/message-handler'
import { getObjectDiff } from '@/shared/utils/getObjectDiff'
import { hasFormChanges } from '@/shared/data-validation/compareChanges'
import { buildClientId } from '@/lib/utils/clientId'

import { useCreateItemPosition, useUpdateItemPosition } from '../../api/itemPositionApi'
import { useItemPositionByClientId } from '../../hooks/useItemSelectors'
import { useItemPopupController } from '../../hooks/useItemPopupController'
import { upsertItemPosition } from '../../store/itemPositionStore'
import type { ItemPositionPayload } from '../../types/itemPosition'

import type { ItemPositionFormPayload, ItemPositionFormState } from './ItemPositionForm.types'

export const useItemPositionFormSubmit = ({
  payload,
  formState,
  validateForm,
  initialFormRef,
}: {
  payload: ItemPositionFormPayload
  formState: ItemPositionFormState
  validateForm: () => boolean
  initialFormRef: React.RefObject<ItemPositionFormState | null>
}) => {
  const { showMessage } = useMessageHandler()
  const createItemPosition = useCreateItemPosition()
  const updateItemPosition = useUpdateItemPosition()
  const existing = useItemPositionByClientId(payload.clientId ?? null)
  const { closePositionForm } = useItemPopupController()

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
    const basePayload: ItemPositionPayload = {
      client_id: existing?.client_id ?? buildClientId('item_position'),
      name: diff.name ?? formState.name,
      description: diff.description ?? formState.description,
      default: diff.default ?? formState.default,
      is_system: diff.is_system ?? formState.is_system,
    }

    try {
      if (payload.mode === 'create') {
        await createItemPosition(basePayload)
        upsertItemPosition({ ...basePayload })
      } else if (existing?.id) {
        await updateItemPosition(existing.id, basePayload)
        upsertItemPosition({ ...existing, ...basePayload })
      }
      closePositionForm()
    } catch (error) {
      console.error('Failed to save item position', error)
      showMessage({ status: 500, message: 'Unable to save item position.' })
    }
  }, [
    closePositionForm,
    createItemPosition,
    existing,
    formState,
    initialFormRef,
    payload.mode,
    showMessage,
    updateItemPosition,
    validateForm,
  ])

  return { handleSave }
}
