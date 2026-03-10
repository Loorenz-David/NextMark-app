import { useCallback } from 'react'

import { ApiError } from '@/lib/api/ApiClient'
import { useMessageHandler } from '@/shared/message-handler'

import { useUpdateOrderState } from '../api/orderState.api'
import { useOrderStateRegistry } from '../domain/useOrderStateRegistry'
import { selectOrderByClientId, updateOrderByClientId, useOrderStore } from '../store/order.store'

export const useOrderStateController = () => {
  const updateOrderStateApi = useUpdateOrderState()
  const registry = useOrderStateRegistry()
  const { showMessage } = useMessageHandler()

  const setOrderState = useCallback(
    async (clientId: string, targetStateId: number): Promise<boolean> => {
      const order = selectOrderByClientId(clientId)(useOrderStore.getState())
      if (!order) return false
      if (typeof order.id !== 'number') return false
      if (typeof order.order_state_id !== 'number') return false

      const currentStateId = order.order_state_id
      if (currentStateId === targetStateId) return true

      const targetState = registry.getById(targetStateId)
      if (!targetState) return false

      updateOrderByClientId(clientId, (currentOrder) => ({
        ...currentOrder,
        order_state_id: targetStateId,
      }))

      try {
        await updateOrderStateApi(order.id, targetStateId)
        return true
      } catch (error) {
        updateOrderByClientId(clientId, (currentOrder) => ({
          ...currentOrder,
          order_state_id: currentStateId,
        }))

        const message = error instanceof ApiError ? error.message : 'Unable to update order state.'
        const status = error instanceof ApiError ? error.status : 500
        showMessage({ status, message })
        return false
      }
    },
    [registry, showMessage, updateOrderStateApi],
  )

  const advanceOrderState = useCallback(
    async (clientId: string): Promise<boolean> => {
      const order = selectOrderByClientId(clientId)(useOrderStore.getState())
      if (!order) return false
      if (typeof order.order_state_id !== 'number') return false

      const nextStateId = registry.getNextStateId(order.order_state_id)
      if (nextStateId == null) return false

      return setOrderState(clientId, nextStateId)
    },
    [registry, setOrderState],
  )

  return {
    advanceOrderState,
    setOrderState,
  }
}
