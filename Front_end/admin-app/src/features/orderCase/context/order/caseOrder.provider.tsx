import type { PropsWithChildren } from 'react'

import { useOrderCasesByOrderFlow } from '../../flows/orderCasePages.flow'
import { useCaseOrderActions } from '../../pages/order/order.actions'
import { CaseOrderContext } from './caseOrder.context'

type CaseOrderProviderProps = PropsWithChildren<{
  orderId: number
  onClose?: () => void
}>

export const CaseOrderProvider = ({ children, orderId, onClose }: CaseOrderProviderProps) => {
  const { cases, casesStats } = useOrderCasesByOrderFlow(orderId)
  const caseOrderActions = useCaseOrderActions({ onClose })

  const value = {
    cases,
    casesStats,
    caseOrderActions,
  }

  return <CaseOrderContext.Provider value={value}>{children}</CaseOrderContext.Provider>
}
