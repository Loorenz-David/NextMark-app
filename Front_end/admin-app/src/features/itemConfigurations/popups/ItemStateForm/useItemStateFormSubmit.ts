import { useCallback } from 'react'

import { useMessageHandler } from '@shared-message-handler'
import { getObjectDiff } from '@shared-utils'
import { hasFormChanges } from '@shared-domain'
import { buildClientId } from '@/lib/utils/clientId'

import { useCreateItemState, useUpdateItemState } from '../../api/itemStateApi'
import { useItemStateByClientId, useItemStates } from '../../hooks/useItemSelectors'
import { useItemPopupController } from '../../hooks/useItemPopupController'
import { upsertItemState } from '../../store/itemStateStore'
import type { ItemStatePayload } from '../../types/itemState'
import type { ItemStateEntryPoints } from '../../types/itemState'

import type { ItemStateFormPayload, ItemStateFormState } from './ItemStateForm.types'

export const useItemStateFormSubmit = ({
  payload,
  formState,
  validateForm,
  initialFormRef,
}: {
  payload: ItemStateFormPayload
  formState: ItemStateFormState
  validateForm: () => boolean
  initialFormRef: React.RefObject<ItemStateFormState | null>
}) => {
  const { showMessage } = useMessageHandler()
  const createItemState = useCreateItemState()
  const updateItemState = useUpdateItemState()
  const states = useItemStates()
  const existing = useItemStateByClientId(payload.clientId ?? null)
  const { closeStateForm } = useItemPopupController()

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
    const maxIndex = Math.max(
      0,
      ...states
        .filter((state) => !state.is_system && typeof state.index === 'number')
        .map((state) => state.index as number),
    )
    const createPayload: ItemStatePayload = {
      client_id: existing?.client_id ?? buildClientId('item_state'),
      name: formState.name,
      color: formState.color,
      description: formState.description,
      index: maxIndex + 1,
    }

    try {
      if (payload.mode === 'create') {
        await createItemState(createPayload)
        upsertItemState({
          ...createPayload,
          entry_point: (createPayload.entry_point ?? null) as ItemStateEntryPoints | null,
        })
      } else if (existing?.id) {
        const allowedFields = new Set([
          'client_id',
          'name',
          'color',
          'description',
          'index',
        ])
        const safeDiff: Record<string, unknown> = Object.fromEntries(
          Object.entries(diff).filter(([key]) => allowedFields.has(key)),
        )
        if ('index' in safeDiff) {
          const parsedIndex = Number(safeDiff.index)
          safeDiff.index = Number.isNaN(parsedIndex) ? null : parsedIndex
        }
        await updateItemState(existing.id, safeDiff)
        const nextItem = {
          ...existing,
          ...(safeDiff as Partial<typeof existing>),
          index:
            typeof safeDiff.index === 'number' || safeDiff.index === null
              ? safeDiff.index
              : existing.index ?? null,
        }
        upsertItemState(nextItem as never)
      }
      closeStateForm()
    } catch (error) {
      console.error('Failed to save item state', error)
      showMessage({ status: 500, message: 'Unable to save item state.' })
    }
  }, [
    closeStateForm,
    createItemState,
    existing,
    formState,
    initialFormRef,
    payload.mode,
    showMessage,
    updateItemState,
    validateForm,
  ])

  return { handleSave }
}
