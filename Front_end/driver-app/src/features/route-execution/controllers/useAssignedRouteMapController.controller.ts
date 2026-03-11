import { useMemo } from 'react'
import { mapAssignedRouteToMapMarkers } from '../domain/mapAssignedRouteToMapMarkers'
import { mapAssignedRouteToMapRoute } from '../domain/mapAssignedRouteToMapRoute'
import type { AssignedRouteViewModel } from '@/app/contracts/routeExecution.types'

type UseAssignedRouteMapControllerDependencies = {
  onOpenStopDetail: (stopClientId: string) => void
  selectedStopClientId?: string | null
}

export function useAssignedRouteMapController(
  route: AssignedRouteViewModel | null,
  dependencies: UseAssignedRouteMapControllerDependencies,
) {

  return useMemo(() => {
    if (!route) {
      return {
        markers: [],
        mapRoute: null,
        selectedMarkerId: null,
      }
    }

    return {
      markers: mapAssignedRouteToMapMarkers(route, {
        onMarkerClick: (stopClientId) => {
          dependencies.onOpenStopDetail(stopClientId)
        },
      }),
      mapRoute: mapAssignedRouteToMapRoute(route),
      selectedMarkerId: dependencies.selectedStopClientId ?? route.activeStopClientId ?? null,
    }
  }, [dependencies, route])
}
