import { useMemo, type PropsWithChildren } from 'react'

import { apiClient } from '@/lib/api/ApiClient'

import { useOrderCaseDetailsFlow } from '../../flows/orderCasePages.flow'
import { useDetailsActions } from '../../pages/details/details.actions'
import { DetailsCaseContext } from './caseDetails.context'

type CaseDetailsPageProviderProps = PropsWithChildren<{
  orderCaseClientId: string
  onClose?: () => void
}>

export const CaseDetailsPageProvider = ({
  children,
  orderCaseClientId,
  onClose,
}: CaseDetailsPageProviderProps) => {
  const { orderCase } = useOrderCaseDetailsFlow(orderCaseClientId)

  const detailsActions = useDetailsActions(orderCaseClientId, { onClose })

  const currentUserId = useMemo(() => {
    const userId = apiClient.getSessionUserId()
    if (typeof userId !== 'number') return null
    return userId
  }, [])

  const value = {
    orderCase,
    detailsActions,
    currentUserId,
  }

  return <DetailsCaseContext.Provider value={value}>{children}</DetailsCaseContext.Provider>
}
