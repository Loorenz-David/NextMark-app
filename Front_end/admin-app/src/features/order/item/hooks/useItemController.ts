import { useCallback } from 'react'

import { buildClientId } from '@/lib/utils/clientId'
import { useMessageHandler } from '@shared-message-handler'

import { useCreateItem, useDeleteItem, useUpdateItem as useUpdateItemApi } from '../api/item.api'
import { useItemValidation } from '../domain/useItemValidation'
import {
  removeItemByClientId,
  selectItemByClientId,
  setItem,
  updateItemByClientId,
  useItemStore,
} from '../store/item.store'
import type {  Item, ItemUpdateFields } from '../types'

const stripImmutableFields = (draft: Item): ItemUpdateFields => {
  return {
    article_number: draft.article_number,
    reference_number: draft.reference_number ?? null,
    item_type: draft.item_type,
    properties: draft.properties ?? null,
    page_link: draft.page_link ?? null,
    dimension_depth: draft.dimension_depth ?? null,
    dimension_height: draft.dimension_height ?? null,
    dimension_width: draft.dimension_width ?? null,
    weight: draft.weight ?? null,
    quantity: draft.quantity ?? 1,
  }
}

export const useItemController = () => {
  const createItemApi = useCreateItem()
  const updateItemApi = useUpdateItemApi()
  const deleteItemApi = useDeleteItem()
  const validation = useItemValidation()
  const { showMessage } = useMessageHandler()

  const saveAutonomousItem = useCallback(
    async ({
      orderId,
      itemId,
      draft,
    }: {
      orderId: number
      itemId?: string
      draft: Item
    }) => {
      const normalizedDraft: Item = {
        ...draft,
        order_id: orderId,
        client_id: draft.client_id || buildClientId('item'),
      }

      if (!validation.validateItemDraft(normalizedDraft)) {
        showMessage({ status: 400, message: 'Please check the item fields.' })
        return false
      }

      if (itemId) {

        const existing = selectItemByClientId(itemId)(useItemStore.getState())
        if (!existing) {
          showMessage({ status: 404, message: 'Item not found for update.' })
          return false
        }

        if (existing.order_id !== orderId) {
          showMessage({ status: 400, message: 'Item does not belong to this order.' })
          return false
        }

        if (!existing.id) {
          showMessage({ status: 400, message: 'Item must be synced before update.' })
          return false
        }

        const previous = { ...existing }

        updateItemByClientId(existing.client_id, () => ({
          ...existing,
          ...normalizedDraft,
        }))

        try {
          await updateItemApi({
            target_id: existing.id,
            fields: stripImmutableFields(normalizedDraft),
          })
          return true
        } catch (error) {
          console.error('Failed to update item', error)
          updateItemByClientId(existing.client_id, () => previous)
          showMessage({ status: 500, message: 'Unable to update item.' })
          return false
        }
      }

      const optimisticItem: Item = {
        ...normalizedDraft,
      }

      setItem(optimisticItem)

      try {
        const response = await createItemApi(optimisticItem)
   
        const serverId = response.data?.item?.[optimisticItem.client_id]
        if (typeof serverId === 'number') {
          updateItemByClientId(optimisticItem.client_id, (current) => ({
            ...current,
            id: serverId,
          }))
        }

        return true
      } catch (error) {
        console.error('Failed to create item', error)
        removeItemByClientId(optimisticItem.client_id)
        showMessage({ status: 500, message: 'Unable to create item.' })
        return false
      }
    },
    [createItemApi, showMessage, updateItemApi, validation],
  )

  const deleteAutonomousItem = useCallback(
    async (itemId: string) => {
      const existing = selectItemByClientId(itemId)(useItemStore.getState())
      if (!existing) {
        showMessage({ status: 404, message: 'Item not found for deletion.' })
        return false
      }

      const previous = { ...existing }
      removeItemByClientId(existing.client_id)

      if (!existing.id) {
        return true
      }

      try {
        await deleteItemApi({ target_id: existing.id })
        return true
      } catch (error) {
        console.error('Failed to delete item', error)
        setItem(previous)
        showMessage({ status: 500, message: 'Unable to delete item.' })
        return false
      }
    },
    [deleteItemApi, showMessage],
  )

  return {
    saveAutonomousItem,
    deleteAutonomousItem,
  }
}
