import { useSyncExternalStore } from 'react'
import { useRouteExecutionShell } from '../providers/routeExecutionShell.context'
import { selectAssignedRoute } from '../stores/routeExecution.selectors'
import { useAssignedRouteMapController } from './useAssignedRouteMapController.controller'

type UseRouteExecutionMapSurfaceControllerDependencies = {
  selectedStopClientId?: string | null
  onOpenStopDetail: (stopClientId: string) => void
}

export function useRouteExecutionMapSurfaceController(
  dependencies: UseRouteExecutionMapSurfaceControllerDependencies,
) {
  const { store } = useRouteExecutionShell()

  const route = useSyncExternalStore(
    store.subscribe,
    () => selectAssignedRoute(store.getState()),
    () => selectAssignedRoute(store.getState()),
  )

  return useAssignedRouteMapController(route, dependencies)
}
