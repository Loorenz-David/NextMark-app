import { useCallback } from 'react'

import { ApiError } from '@/lib/api/ApiClient'
import { useMessageHandler } from '@shared-message-handler'

import { routeOptimizationApi } from '@/features/plan/planTypes/localDelivery/api/routeOptimization.api'
import type {
  RouteOptimizationPayload,
  RouteOptimizationResponse,
} from '@/features/plan/planTypes/localDelivery/api/routeOptimization.api'
import {
  normalizeRouteOptimizationSolutions,
  normalizeRouteOptimizationStops,
} from '@/features/plan/planTypes/localDelivery/api/mappers/routeOptimization.mapper'
import { upsertRouteSolution } from '@/features/plan/planTypes/localDelivery/store/routeSolution.store'
import { upsertRouteSolutionStop } from '@/features/plan/planTypes/localDelivery/store/routeSolutionStop.store'
import {
  getRouteOptimizationBlockMessage,
  isEndDateInFuture,
} from '@/features/plan/planTypes/localDelivery/utils/routeOptimizationGuard'
import { getPlanEndDateByLocalDeliveryPlanId } from '@/features/plan/planTypes/localDelivery/store/localDelivery.slice'

const resolveError = (error: unknown, fallback: string) => ({
  message: error instanceof ApiError ? error.message : fallback,
  status: error instanceof ApiError ? error.status : 500,
})

const applyOptimizationPayload = (payload?: RouteOptimizationResponse | null) => {
  if (!payload) return
  normalizeRouteOptimizationSolutions(payload).forEach((solution) => {
    if (solution?.client_id) {
      upsertRouteSolution(solution)
    }
  })

  const stops = [
    ...normalizeRouteOptimizationStops(payload.route_solution_stop),
    ...normalizeRouteOptimizationStops(payload.route_solution_stop_skipped),
  ]
  stops.forEach((stop) => {
    if (stop?.client_id) {
      upsertRouteSolutionStop(stop)
    }
  })
}

export function useRouteOptimizationMutations() {
  const { showMessage } = useMessageHandler()

  const createOptimization = useCallback(
    async (payload: RouteOptimizationPayload) => {
      const endDate = getPlanEndDateByLocalDeliveryPlanId(payload.local_delivery_plan_id)

      if (!isEndDateInFuture(endDate)) {
        showMessage({ status: 400, message: getRouteOptimizationBlockMessage() })
        return null
      }
      try {
        const response = await routeOptimizationApi.createOptimization(payload)
        applyOptimizationPayload(response.data)
        return response.data
      } catch (error) {
        const resolved = resolveError(error, 'Unable to create route optimization.')
        console.error('Failed to create route optimization', error)
        showMessage({ status: resolved.status, message: resolved.message })
        return null
      }
    },
    [showMessage],
  )

  const updateOptimization = useCallback(
    async (payload: RouteOptimizationPayload) => {
      const endDate = getPlanEndDateByLocalDeliveryPlanId(payload.local_delivery_plan_id)
      if (!isEndDateInFuture(endDate)) {
        showMessage({ status: 400, message: getRouteOptimizationBlockMessage() })
        return null
      }
      try {
        const response = await routeOptimizationApi.updateOptimization(payload)
        applyOptimizationPayload(response.data)
        return response.data
      } catch (error) {
        const resolved = resolveError(error, 'Unable to update route optimization.')
        console.error('Failed to update route optimization', error)
        showMessage({ status: resolved.status, message: resolved.message })
        return null
      }
    },
    [showMessage],
  )

  return {
    createOptimization,
    updateOptimization,
  }
}
