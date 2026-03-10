import { useCallback } from 'react'

import { ApiError } from '@/lib/api/ApiClient'
import { useMessageHandler } from '@/shared/message-handler'
import { optimisticTransaction } from '@/shared/optimistic'
import {
  removeRouteSolutionStopsByOrderId,
  selectRouteSolutionStopsByOrderId,
  useRouteSolutionStopStore,
  upsertRouteSolutionStops,
} from '@/features/plan/planTypes/localDelivery/store/routeSolutionStop.store'
import { upsertRouteSolution } from '@/features/plan/planTypes/localDelivery/store/routeSolution.store'

import { useUpdateOrderDeliveryPlan as useUpdateOrderDeliveryPlanApi } from '../api/orderApi'
import { normalizeOrderStopResponse } from '../domain/orderStopResponse'
import type { RouteSolutionStop } from '@/features/plan/planTypes/localDelivery/types/routeSolutionStop'
import {
  setOrder,
  selectOrderByClientId,
  selectOrderByServerId,
  setOrderPlanId,
  useOrderStore,
} from '../store/order.store'

export const useOrderMutations = () => {
  const updateOrderDeliveryPlanApi = useUpdateOrderDeliveryPlanApi()
  const { showMessage } = useMessageHandler()

  const updateOrderDeliveryPlan = useCallback(
    async (orderId: number | string, planId: number | string | null) => {
      if (planId == null) {
        showMessage({ status: 400, message: 'Missing delivery plan id.' })
        return null
      }
      
      const order = typeof orderId === 'string'
        ? selectOrderByClientId(orderId)(useOrderStore.getState())
        : selectOrderByServerId(orderId)(useOrderStore.getState())

        
      if (!order) {
        showMessage({ status: 404, message: 'Order not found for plan update.' })
        return false
      }

      if (!order.id) {
        showMessage({ status: 400, message: 'Order must be synced before plan update.' })
        return false
      }
      const orderServerId = order.id

      const parsedPlanId = typeof planId === 'number' ? planId : Number(planId)
      if (Number.isNaN(parsedPlanId)) {
        showMessage({ status: 400, message: 'Invalid delivery plan id.' })
        return false
      }

      return optimisticTransaction({
        snapshot: () => ({
          previousPlanId: order.delivery_plan_id ?? null,
          previousStops: selectRouteSolutionStopsByOrderId(orderServerId)(
            useRouteSolutionStopStore.getState(),
          ),
        }),
        mutate: () => {
          setOrderPlanId(order.client_id, parsedPlanId)
          removeRouteSolutionStopsByOrderId(orderServerId)
        },
        request: () => updateOrderDeliveryPlanApi(orderServerId, parsedPlanId),
        commit: (response) => {
          const updatedBundles = response.data?.updated ?? []
          updatedBundles.forEach((bundle) => {
            const updatedOrder = bundle?.order
            if (!updatedOrder?.id) return

            setOrder(updatedOrder)
            removeRouteSolutionStopsByOrderId(updatedOrder.id)

            const normalizedStops = normalizeOrderStopResponse(bundle.order_stops)
            if (normalizedStops) {
              upsertRouteSolutionStops(normalizedStops)
            }
            const changedSolutions = bundle.route_solution ?? []
            changedSolutions.forEach((solution) => {
              if (solution?.client_id) {
                upsertRouteSolution(solution)
              }
            })
          })
        },
        rollback: (snapshot) => {
          const {
            previousPlanId,
            previousStops,
          } = snapshot as { previousPlanId: number | null; previousStops: RouteSolutionStop[] }
          setOrderPlanId(order.client_id, previousPlanId)
          if (previousStops.length) {
            const rollbackStops = {
              byClientId: Object.fromEntries(
                previousStops
                  .filter((stop: RouteSolutionStop) => !!stop?.client_id)
                  .map((stop: RouteSolutionStop) => [stop.client_id, stop]),
              ),
              allIds: previousStops
                .map((stop: RouteSolutionStop) => stop.client_id)
                .filter((clientId: string | null | undefined): clientId is string => !!clientId),
            }
            if (rollbackStops.allIds.length) {
              upsertRouteSolutionStops(rollbackStops)
            }
          }
        },
        onError: (error) => {
          const message = error instanceof ApiError ? error.message : 'Unable to update order plan.'
          const status = error instanceof ApiError ? error.status : 500
          showMessage({ status, message })
        },
      })
    },
    [showMessage, updateOrderDeliveryPlanApi],
  )

  return {
    updateOrderDeliveryPlan,
  }
}
