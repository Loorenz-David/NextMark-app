import type { DriverLocationUpdatedPayload } from '@shared-realtime'

import type { LocalDeliveryPlan } from '@/features/plan/planTypes/localDelivery/types/localDeliveryPlan'
import type { RouteSolution } from '@/features/plan/planTypes/localDelivery/types/routeSolution'
import type { MapOrder } from '@/shared/map'

export const DRIVER_LIVE_ACTIVE_MAX_AGE_MS = 5 * 60 * 1000

export type DriverLocationMarkerActivity = 'active' | 'passive'
export type DriverLocationMarkerScope = 'local-delivery' | 'orders'

const parseTimestamp = (value?: string | null): number | null => {
  if (!value) return null
  const parsed = new Date(value).getTime()
  return Number.isFinite(parsed) ? parsed : null
}

const getMarkerId = (scope: DriverLocationMarkerScope, driverId: number) =>
  `driver-live:${scope}:${driverId}`

export const resolveDriverLocationActivity = (
  position: DriverLocationUpdatedPayload,
  now = Date.now(),
): DriverLocationMarkerActivity => {
  const timestamp = parseTimestamp(position.timestamp)
  if (timestamp == null) return 'passive'
  return now - timestamp <= DRIVER_LIVE_ACTIVE_MAX_AGE_MS ? 'active' : 'passive'
}

export const buildDriverLocationMarkerClassName = (
  activity: DriverLocationMarkerActivity,
) => `driver-live-marker driver-live-marker--${activity}`

export const buildDriverLocationMarker = ({
  scope,
  position,
  onClick,
  onMouseEnter,
  onMouseLeave,
  now = Date.now(),
}: {
  scope: DriverLocationMarkerScope
  position: DriverLocationUpdatedPayload
  onClick: (event: MouseEvent) => void
  onMouseEnter?: (event: MouseEvent, position: DriverLocationUpdatedPayload) => void
  onMouseLeave?: (event: MouseEvent, position: DriverLocationUpdatedPayload) => void
  now?: number
}): MapOrder => {
  const activity = resolveDriverLocationActivity(position, now)

  return {
    id: getMarkerId(scope, position.driver_id),
    coordinates: position.coords,
    className: buildDriverLocationMarkerClassName(activity),
    onClick,
    onMouseEnter: onMouseEnter
      ? (event: MouseEvent) => onMouseEnter(event, position)
      : undefined,
    onMouseLeave: onMouseLeave
      ? (event: MouseEvent) => onMouseLeave(event, position)
      : undefined,
  }
}

export const buildLocalDeliveryDriverLocationMarkers = ({
  positions,
  selectedDriverId,
  onClick,
  onMouseEnter,
  onMouseLeave,
  now = Date.now(),
}: {
  positions: DriverLocationUpdatedPayload[]
  selectedDriverId: number | null | undefined
  onClick: (event: MouseEvent) => void
  onMouseEnter?: (event: MouseEvent, position: DriverLocationUpdatedPayload) => void
  onMouseLeave?: (event: MouseEvent, position: DriverLocationUpdatedPayload) => void
  now?: number
}): MapOrder[] => {
  if (selectedDriverId == null) return []

  return positions
    .filter((position) => position.driver_id === selectedDriverId)
    .map((position) =>
      buildDriverLocationMarker({
        scope: 'local-delivery',
        position,
        onClick,
        onMouseEnter,
        onMouseLeave,
        now,
      }),
    )
}

export const buildOrderDriverLocationMarkers = ({
  positions,
  resolvePlanIdByDriverId,
  onResolvedPlanClick,
  onMouseEnter,
  onMouseLeave,
  now = Date.now(),
}: {
  positions: DriverLocationUpdatedPayload[]
  resolvePlanIdByDriverId: (driverId: number) => number | null
  onResolvedPlanClick: (planId: number) => void
  onMouseEnter?: (event: MouseEvent, position: DriverLocationUpdatedPayload) => void
  onMouseLeave?: (event: MouseEvent, position: DriverLocationUpdatedPayload) => void
  now?: number
}): MapOrder[] =>
  positions.map((position) =>
    buildDriverLocationMarker({
      scope: 'orders',
      position,
      onClick: () => {
        const planId = resolvePlanIdByDriverId(position.driver_id)
        if (planId != null) {
          onResolvedPlanClick(planId)
        }
      },
      onMouseEnter,
      onMouseLeave,
      now,
    }),
  )

export const resolveActiveLocalDeliveryPlanIdByDriverId = ({
  driverId,
  routeSolutions,
  localDeliveryPlans,
}: {
  driverId: number
  routeSolutions: RouteSolution[]
  localDeliveryPlans: LocalDeliveryPlan[]
}): number | null => {
  const bestMatch = routeSolutions
    .filter(
      (solution) =>
        solution.driver_id === driverId
        && solution.actual_start_time != null
        && solution.actual_end_time == null,
    )
    .sort((left, right) => {
      const leftTime = parseTimestamp(left.actual_start_time) ?? Number.NEGATIVE_INFINITY
      const rightTime = parseTimestamp(right.actual_start_time) ?? Number.NEGATIVE_INFINITY
      return rightTime - leftTime
    })[0]

  if (!bestMatch?.local_delivery_plan_id) {
    return null
  }

  const localDeliveryPlan = localDeliveryPlans.find(
    (plan) => plan.id === bestMatch.local_delivery_plan_id,
  )

  return localDeliveryPlan?.delivery_plan_id ?? null
}
