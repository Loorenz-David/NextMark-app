import { normalizeOrderStopResponse } from '@/features/order/domain/orderStopResponse'
import { upsertRouteSolution } from '@/features/plan/planTypes/localDelivery/store/routeSolution.store'
import { upsertRouteSolutionStops } from '@/features/plan/planTypes/localDelivery/store/routeSolutionStop.store'
import type { RouteSolution } from '@/features/plan/planTypes/localDelivery/types/routeSolution'
import type { RouteSolutionStop } from '@/features/plan/planTypes/localDelivery/types/routeSolutionStop'

type RouteArtifactsBundle = {
  order_stops?: RouteSolutionStop[]
  route_solution?: RouteSolution[]
}

export const applyOrderRouteArtifacts = (bundle?: RouteArtifactsBundle | null): void => {
  if (!bundle) return

  const normalizedStops = normalizeOrderStopResponse(bundle.order_stops)
  if (normalizedStops) {
    upsertRouteSolutionStops(normalizedStops)
  }

  const routeSolutions = Array.isArray(bundle.route_solution) ? bundle.route_solution : []
  routeSolutions.forEach((solution) => {
    if (solution?.client_id) {
      upsertRouteSolution(solution)
    }
  })
}
