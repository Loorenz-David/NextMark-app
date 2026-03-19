import { useCallback } from 'react'

import { ApiError } from '@/lib/api/ApiClient'
import { useMessageHandler } from '@shared-message-handler'
import { optimisticTransaction } from '@shared-optimistic'
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
import { patchPlanTotals, selectPlanByServerId, usePlanStore } from '@/features/plan/store/plan.slice'

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

      // Capture plan total snapshots before the optimistic transaction so both
      // snapshot() and mutate() share the same pre-mutation baseline.
      type PlanTotalsSnapshot = {
        total_weight: number | null
        total_volume: number | null
        total_items: number | null
        total_orders: number | null
      }
      const planStoreState = usePlanStore.getState()
      const oldPlanId = order.delivery_plan_id ?? null
      const oldPlan = oldPlanId != null ? selectPlanByServerId(oldPlanId)(planStoreState) : null
      const newPlan = selectPlanByServerId(parsedPlanId)(planStoreState)

      const oldPlanTotalSnapshot: PlanTotalsSnapshot | null =
        oldPlan?.id != null
          ? {
              total_weight: oldPlan.total_weight ?? null,
              total_volume: oldPlan.total_volume ?? null,
              total_items: oldPlan.total_items ?? null,
              total_orders: oldPlan.total_orders ?? null,
            }
          : null

      const newPlanTotalSnapshot: PlanTotalsSnapshot | null =
        newPlan?.id != null
          ? {
              total_weight: newPlan.total_weight ?? null,
              total_volume: newPlan.total_volume ?? null,
              total_items: newPlan.total_items ?? null,
              total_orders: newPlan.total_orders ?? null,
            }
          : null

      return optimisticTransaction({
        snapshot: () => ({
          previousPlanId: order.delivery_plan_id ?? null,
          previousStops: selectRouteSolutionStopsByOrderId(orderServerId)(
            useRouteSolutionStopStore.getState(),
          ),
          oldPlanId: oldPlan?.id ?? null,
          oldPlanTotals: oldPlanTotalSnapshot,
          newPlanId: parsedPlanId,
          newPlanTotals: newPlanTotalSnapshot,
        }),
        mutate: () => {
          setOrderPlanId(order.client_id, parsedPlanId)
          removeRouteSolutionStopsByOrderId(orderServerId)

          // Optimistic: subtract this order's weight/volume/items from the old plan
          if (oldPlan?.id != null && oldPlanTotalSnapshot != null) {
            patchPlanTotals(oldPlan.id, {
              total_weight: Math.max(
                0,
                (oldPlanTotalSnapshot.total_weight ?? 0) - (order.total_weight ?? 0),
              ),
              total_volume: Math.max(
                0,
                (oldPlanTotalSnapshot.total_volume ?? 0) - (order.total_volume ?? 0),
              ),
              total_items: Math.max(
                0,
                (oldPlanTotalSnapshot.total_items ?? 0) - (order.total_items ?? 0),
              ),
              total_orders: Math.max(0, (oldPlanTotalSnapshot.total_orders ?? 1) - 1),
            })
          }

          // Optimistic: add this order's weight/volume/items to the new plan
          if (newPlan?.id != null) {
            patchPlanTotals(newPlan.id, {
              total_weight:
                (newPlanTotalSnapshot?.total_weight ?? 0) + (order.total_weight ?? 0),
              total_volume:
                (newPlanTotalSnapshot?.total_volume ?? 0) + (order.total_volume ?? 0),
              total_items:
                (newPlanTotalSnapshot?.total_items ?? 0) + (order.total_items ?? 0),
              total_orders: (newPlanTotalSnapshot?.total_orders ?? 0) + 1,
            })
          }
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

          // Server-authoritative plan totals override the optimistic deltas
          response.data?.plan_totals?.forEach((p) => {
            patchPlanTotals(p.id, {
              total_weight: p.total_weight,
              total_volume: p.total_volume,
              total_items: p.total_items,
              total_orders: p.total_orders,
            })
          })
        },
        rollback: (snapshot) => {
          const {
            previousPlanId,
            previousStops,
            oldPlanId: snapOldPlanId,
            oldPlanTotals: snapOldTotals,
            newPlanId: snapNewPlanId,
            newPlanTotals: snapNewTotals,
          } = snapshot as {
            previousPlanId: number | null
            previousStops: RouteSolutionStop[]
            oldPlanId: number | null
            oldPlanTotals: PlanTotalsSnapshot | null
            newPlanId: number
            newPlanTotals: PlanTotalsSnapshot | null
          }
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

          // Restore plan total snapshots
          if (snapOldPlanId != null && snapOldTotals != null) {
            patchPlanTotals(snapOldPlanId, snapOldTotals)
          }
          if (snapNewTotals != null) {
            patchPlanTotals(snapNewPlanId, snapNewTotals)
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
