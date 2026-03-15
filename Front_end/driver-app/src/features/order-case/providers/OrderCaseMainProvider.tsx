import type { ReactNode } from 'react'
import { useOrderCaseMainController } from '../controllers'
import { OrderCaseMainContextProvider } from './orderCaseMain.context'

type OrderCaseMainProviderProps = {
  children: ReactNode
  closeOverlay: () => void
  orderId: number
}

export function OrderCaseMainProvider({
  children,
  closeOverlay,
  orderId,
}: OrderCaseMainProviderProps) {
  const controller = useOrderCaseMainController({
    orderId,
    closeOverlay,
  })

  return (
    <OrderCaseMainContextProvider value={controller}>
      {children}
    </OrderCaseMainContextProvider>
  )
}
