import { useEffect, useMemo, type PropsWithChildren } from 'react'

import { useMobile } from '@/app/contexts/MobileContext'
import { usePopupManager, useSectionManager } from '@/shared/resource-manager/useResourceManager'

import { useOrderDetailActions } from '../actions/orderDetails.actions'
import { useOrderDetailKeyboardFlow } from '../flows/orderDetailKeyboard.flow'
import { useOrderByClientId, useOrderByServerId } from '../store/orderHooks.store'
import { useOrderStateByServerId } from '../store/orderStateHooks.store'
import { OrderDetailContextProvider } from './OrderDetailContext'

type OrderDetailPayload = {
  clientId?: string
  serverId?: number
  mode?: 'view' | 'edit'
}

type OrderDetailProviderProps = PropsWithChildren<{
  payload?: OrderDetailPayload
  onClose?: () => void
}>

export const OrderDetailProvider = ({ payload, onClose, children }: OrderDetailProviderProps) => {
  const { isMobile } = useMobile()
  const popupManager = usePopupManager()
  const sectionManager = useSectionManager()

  const orderDetailActions = useOrderDetailActions({ onClose })

  const clientId = payload?.clientId ?? null
  const serverId = payload?.serverId ?? null

  const orderByClient = useOrderByClientId(clientId)
  const orderByServer = useOrderByServerId(serverId)
  const order = orderByClient ?? orderByServer ?? null

  const orderServerId = typeof order?.id === 'number' ? order.id : null
  const orderState = useOrderStateByServerId(order?.order_state_id ?? null) ?? null

  useOrderDetailKeyboardFlow({
    isEnabled: !isMobile,
    clientId,
    orderId: order?.id,
    orderReference: order?.reference_number ?? '',
    isPopupOpen: () => popupManager.getOpenCount() > 0,
    isCaseOpen: () => sectionManager.hasKey('orderCase.orderCases'),
    onEdit: orderDetailActions.handleEditOrder,
    onOpenCases: orderDetailActions.handleOpenOrderCases,
  })

 

  const value = useMemo(
    () => ({
      order,
      orderState,
      orderServerId,
      openOrderForm: orderDetailActions.openOrderForm,
      openOrderCases: orderDetailActions.openOrderCases,
      closeOrderDetail: orderDetailActions.closeOrderDetail,
      advanceDetailOrderState: orderDetailActions.advanceDetailOrderState,
    }),
    [order, orderDetailActions, orderServerId, orderState],
  )

  return <OrderDetailContextProvider value={value}>{children}</OrderDetailContextProvider>
}
