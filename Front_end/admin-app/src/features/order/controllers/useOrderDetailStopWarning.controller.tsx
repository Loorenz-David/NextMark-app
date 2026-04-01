import { useMemo, type ReactNode } from 'react'

import {
  RouteStopWarnings,
  hasRouteStopTimeWindowWarning,
  useSelectedRouteSolutionStopByOrderId,
} from '@/features/plan/routeGroup'

import type { Order } from '../types/order'

type UseOrderDetailStopWarningControllerResult = {
  initialCarouselIndex: number
  timeWindowHeaderAddon: ReactNode | null
}

type UseOrderDetailStopWarningControllerParams = {
  order: Order | null
  routeGroupId?: number | null
  planStartDate?: string | null
}

export const useOrderDetailStopWarningController = ({
  order,
  routeGroupId,
  planStartDate,
}: UseOrderDetailStopWarningControllerParams): UseOrderDetailStopWarningControllerResult => {
  const stop = useSelectedRouteSolutionStopByOrderId(
    order?.id ?? null,
    order?.route_group_id ?? routeGroupId ?? null,
  )

  const hasTimeWindowWarning = hasRouteStopTimeWindowWarning(stop)

  return useMemo(
    () => ({
      initialCarouselIndex: hasTimeWindowWarning ? 2 : 0,
      timeWindowHeaderAddon: stop ? (
        <RouteStopWarnings stop={stop} planStartDate={planStartDate} />
      ) : null,
    }),
    [hasTimeWindowWarning, planStartDate, stop],
  )
}
