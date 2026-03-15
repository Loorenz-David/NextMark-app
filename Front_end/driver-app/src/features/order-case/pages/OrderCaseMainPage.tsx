import { motion } from 'framer-motion'
import { OrderCaseChatPage } from './OrderCaseChatPage'
import { OrderCaseListPage } from './OrderCaseListPage'
import { OrderCaseMainProvider, useOrderCaseMainContext } from '../providers'

type OrderCaseMainPageProps = {
  orderId: number
  orderClientId: string
  stopClientId: string
  onClose: () => void
}

const pageTransition = {
  type: 'spring',
  stiffness: 320,
  damping: 34,
  mass: 0.8,
} as const

function OrderCaseMainPageContent() {
  const controller = useOrderCaseMainContext()

  return (
    <section className="relative z-10 [grid-area:overlay] flex h-full min-h-0 w-full overflow-hidden bg-[rgb(var(--bg-app-color))] text-white">
      <motion.section
        animate={{
          opacity: controller.view === 'chat' ? 0.92 : 1,
          x: controller.view === 'chat' ? '-18%' : '0%',
        }}
        className="absolute inset-0 flex min-h-0 w-full flex-col bg-[rgb(var(--bg-app-color))]"
        transition={pageTransition}
      >
        <OrderCaseListPage />
      </motion.section>

      <motion.section
        animate={{
          opacity: controller.view === 'chat' ? 1 : 0.98,
          x: controller.view === 'chat' ? '0%' : '100%',
        }}
        className="absolute inset-0 flex min-h-0 w-full flex-col bg-[rgb(var(--bg-app-color))]"
        style={{ pointerEvents: controller.view === 'chat' ? 'auto' : 'none' }}
        transition={pageTransition}
      >
        <OrderCaseChatPage />
      </motion.section>
    </section>
  )
}

export function OrderCaseMainPage({
  orderId,
  onClose,
}: OrderCaseMainPageProps) {
  return (
    <OrderCaseMainProvider closeOverlay={onClose} orderId={orderId}>
      <OrderCaseMainPageContent />
    </OrderCaseMainProvider>
  )
}
