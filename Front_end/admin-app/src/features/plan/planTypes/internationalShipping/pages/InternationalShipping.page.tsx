import { useEffect } from 'react'

import { OrderList } from '@/features/order/components/lists/OrderList'
import { useOrdersByPlanId } from '@/features/order/store/orderHooks.store'
import { usePlanOrders } from '@/features/plan/hooks/usePlanOrders'
import { useInternationalShippingHeaderAction } from '@/features/plan/planTypes/internationalShipping/hooks/useInternationalShippingHeaderAction'
import { useRoutePlanByServerId } from '@/features/plan/store/useRoutePlan.selector'
import { InternationalShippingMainHeader } from '@/features/plan/planTypes/internationalShipping/components/pageHeaders/internationalShippingMainHeader'
import { useOrderActions } from '@/features/order'
import type { Order } from '@/features/order/types/order'

type PlanOrdersPagePayload = {
  planId?: number | string | null
}

type InternationalShippingPageProps = {
  payload: PlanOrdersPagePayload
}



const resolvePlanId = (value: number | string | null | undefined) => {
  if (value == null) return null
  if (typeof value === 'string') {
    const parsed = Number(value)
    return Number.isNaN(parsed) ? null : parsed
  }
  return value
}

export const InternationalShippingPage = ({ payload }: InternationalShippingPageProps) => {
  const { fetchPlanOrders } = usePlanOrders()
  const planId = resolvePlanId(payload?.planId)
  const actions = useInternationalShippingHeaderAction({ planId })
  const plan = useRoutePlanByServerId(planId)
  const orders = useOrdersByPlanId(planId)
  const {openOrderDetail} = useOrderActions()

  useEffect(() => {
    if (planId == null) return
    fetchPlanOrders(planId)
  }, [fetchPlanOrders, planId])

  return (
    <div className="w-full h-full flex flex-col bg-[var(--color-primary)]/5">
      <InternationalShippingMainHeader plan={plan} actions={actions} />
      <OrderList orders={orders}onOpenOrder={(order:Order) => 
              openOrderDetail(
                  {mode:"edit", clientId:order.client_id},
                  { borderLeft:'rgb(var(--color-light-blue-r),0.7)'}
      )}/>
    </div>
  )
}
