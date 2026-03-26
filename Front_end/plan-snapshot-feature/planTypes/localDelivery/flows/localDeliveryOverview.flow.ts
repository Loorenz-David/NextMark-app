import { useCallback } from 'react'

import { ApiError } from '@/lib/api/ApiClient'
import { useMessageHandler } from '@shared-message-handler'

import { planOverviewApi } from '@/features/plan/planTypes/localDelivery/api/planOverview.api'
import type { LocalDeliveryOverviewResponse } from '@/features/plan/planTypes/localDelivery/api/planOverview.api'
import { upsertOrders } from '@/features/order/store/order.store'
import { setOrderListError } from '@/features/order/store/orderList.store'
import {
  setSelectedRouteSolution,
  upsertRouteSolutions,
} from '@/features/plan/planTypes/localDelivery/store/routeSolution.store'
import {
  replaceRouteSolutionStopsForSolution,
  upsertRouteSolutionStops,
} from '@/features/plan/planTypes/localDelivery/store/routeSolutionStop.store'
import { upsertLocalDeliveryPlans } from '@/features/plan/planTypes/localDelivery/store/localDelivery.slice'

const applyOverviewPayload = (
  payload?: LocalDeliveryOverviewResponse | null,
) => {
  if (!payload) return
  if (payload.order) {
    upsertOrders(payload.order)
  }
  if (payload.local_delivery_plan) {
    upsertLocalDeliveryPlans(payload.local_delivery_plan)
  }
  if (payload.route_solution) {
    upsertRouteSolutions(payload.route_solution)
    const selected = payload.route_solution.allIds
      .map((clientId) => payload.route_solution.byClientId[clientId])
      .find((solution) => solution.is_selected)
      ?? payload.route_solution.allIds
        .map((clientId) => payload.route_solution.byClientId[clientId])
        .find((solution) => solution?._representation === 'full')
      ?? payload.route_solution.allIds
        .map((clientId) => payload.route_solution.byClientId[clientId])
        .find(Boolean)
    if (selected?.id) {
      setSelectedRouteSolution(selected.id, selected.local_delivery_plan_id ?? null)
      replaceRouteSolutionStopsForSolution(selected.id, payload.route_solution_stop ?? null)
    }
  }
  if (payload.route_solution_stop && !payload.route_solution) {
    upsertRouteSolutionStops(payload.route_solution_stop)
  }
}

export function useLocalDeliveryOverviewFlow() {
  const { showMessage } = useMessageHandler()

  const fetchLocalDeliveryOverview = useCallback(async (planId: number | string) => {
    try {
      const response = await planOverviewApi.getLocalDeliveryOverview(planId)

      applyOverviewPayload(response.data)
      

      return response.data
    } catch (error) {
      const message = error instanceof ApiError ? error.message : 'Unable to load local delivery overview.'
      const status = error instanceof ApiError ? error.status : 500
      console.error('Failed to fetch local delivery overview', error)
      setOrderListError(message)
      showMessage({ status, message })
      return null
    }
  }, [showMessage])

  return {
    fetchLocalDeliveryOverview,
  }
}
