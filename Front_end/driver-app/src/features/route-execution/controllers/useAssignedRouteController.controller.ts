import { useCallback, useMemo, useSyncExternalStore } from 'react'
import { useDriverBootstrap } from '@/app/bootstrap/useDriverBootstrap'
import { useWorkspace } from '@/app/providers/workspace.context'
import { useDriverAppShell } from '@/app/shell/providers/driverAppShell.context'
import { useRouteExecutionShell } from '../providers/routeExecutionShell.context'
import { mapAssignedRouteToPageDisplay } from '../domain/mapAssignedRouteToPageDisplay'
import { selectRouteExecutionWorkspaceState } from '../stores/routeExecution.selectors'
import { useSelectedAssignedRoute } from './useSelectedAssignedRoute.controller'

export function useAssignedRouteController() {
  const bootstrap = useDriverBootstrap()
  const { workspace } = useWorkspace()
  const { pushBottomSheet } = useDriverAppShell()
  const { store, initializeRouteWorkspace, submitRouteAction } = useRouteExecutionShell()
  const selectedRoute = useSelectedAssignedRoute()

  const routeState = useSyncExternalStore(
    store.subscribe,
    () => selectRouteExecutionWorkspaceState(store.getState()),
    () => selectRouteExecutionWorkspaceState(store.getState()),
  )

  const refreshAssignedRoute = useCallback(async () => {
    await initializeRouteWorkspace()
  }, [initializeRouteWorkspace])

  const startRoute = useCallback(async () => {
    if (!selectedRoute) {
      return
    }

    await submitRouteAction({
      type: 'start-route',
      routeClientId: selectedRoute.routeClientId,
    })
  }, [selectedRoute, submitRouteAction])

  const openStopDetail = useCallback((stopClientId: string) => {
    pushBottomSheet('route-stop-detail', { stopClientId })
  }, [pushBottomSheet])

  const mergedRouteState = useMemo(() => ({
    ...routeState,
    route: selectedRoute,
  }), [routeState, selectedRoute])

  const pageDisplay = useMemo(
    () => mapAssignedRouteToPageDisplay(mergedRouteState.route, mergedRouteState.status, mergedRouteState.error),
    [mergedRouteState.error, mergedRouteState.route, mergedRouteState.status],
  )

  return useMemo(() => ({
    bootstrap,
    workspace,
    routeState: mergedRouteState,
    pageDisplay,
    refreshAssignedRoute,
    startRoute,
    openStopDetail,
  }), [bootstrap, mergedRouteState, openStopDetail, pageDisplay, refreshAssignedRoute, startRoute, workspace])
}
