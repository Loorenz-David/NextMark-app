import type { AssignedRouteViewModel } from '@/app/contracts/routeExecution.types'
import type { MapMarker } from '@/shared/map'

type MapAssignedRouteToMapMarkersDependencies = {
  onMarkerClick: (stopClientId: string) => void
}

export function mapAssignedRouteToMapMarkers(
  route: AssignedRouteViewModel,
  dependencies: MapAssignedRouteToMapMarkersDependencies,
): MapMarker[] {
  return route.stops.flatMap((stop) => {
    const coordinates = stop.address?.coordinates
    if (!coordinates) {
      return []
    }

    return [{
      id: stop.stopClientId,
      coordinates,
      label: stop.stopOrder ? String(stop.stopOrder) : undefined,
      status: stop.isCompleted ? 'completed' : (stop.isActive ? 'in_progress' : 'pending'),
      interactionVariant: 'stop',
      onClick: () => dependencies.onMarkerClick(stop.stopClientId),
      className: stop.isActive ? 'driver-route-marker--active' : undefined,
    }]
  })
}
