import { useCallback } from 'react'

import { usePopupManager, useSectionManager } from '@/shared/resource-manager/useResourceManager'
import { useOrderStateController } from '../controllers/orderState.controller'

export type OrderDetailOpenOrderFormPayload = {
  clientId?: string
  mode?: 'create' | 'edit'
  deliveryPlanId?: number | null
}

export type OrderDetailOpenCasesPayload = {
  orderId?: number
  orderReference: string
}

export const useOrderDetailActions = ({ onClose }: { onClose?: () => void } = {}) => {
  const popupManager = usePopupManager()
  const sectionManager = useSectionManager()
  const { advanceOrderState } = useOrderStateController()

  const openOrderForm = useCallback((payload?: OrderDetailOpenOrderFormPayload) => {
    popupManager.open({ key: 'order.edit', payload: { ...payload, controllBodyLayout: true } })
  }, [popupManager])

  const openOrderCases = useCallback((payload: OrderDetailOpenCasesPayload) => {
    sectionManager.open({
      key: 'orderCase.orderCases', 
      payload,
      parentParams: { borderLeft: 'rgb(var(--color-turques-r),0.7)' },
    })
  }, [sectionManager])

  const handleEditOrder = useCallback(
    (clientId: string) => {
      openOrderForm({ mode: 'edit', clientId })
    },
    [openOrderForm],
  )

  const handleOpenOrderCases = useCallback(
    (payload: OrderDetailOpenCasesPayload) => {
      openOrderCases(payload)
    },
    [openOrderCases],
  )

  const closeOrderDetail = useCallback(() => {
    if (onClose) {
      onClose()
      return
    }
    sectionManager.close()
  }, [onClose, sectionManager])

  const advanceDetailOrderState = useCallback(
    async (clientId: string) => {
      await advanceOrderState(clientId)
    },
    [advanceOrderState],
  )

  return {
    openOrderForm,
    openOrderCases,
    handleEditOrder,
    handleOpenOrderCases,
    closeOrderDetail,
    advanceDetailOrderState,
  }
}
