import type { AssignedRouteViewModel } from '@/app/contracts/routeExecution.types'
import type { MapRoute } from '@/shared/map'

export function mapAssignedRouteToMapRoute(route: AssignedRouteViewModel): MapRoute | null {
  const polylines = [
    route.route?.start_leg_polyline,
    ...route.rawStops.map((stop) => stop.to_next_polyline),
    route.route?.end_leg_polyline,
  ].filter((polyline): polyline is string => Boolean(polyline))

  if (!polylines.length) {
    return null
  }

  return {
    path: polylines,
  }
}
