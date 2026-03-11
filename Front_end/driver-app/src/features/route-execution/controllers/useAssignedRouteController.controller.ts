import { useCallback, useMemo, useSyncExternalStore } from 'react'
import { useDriverBootstrap } from '@/app/bootstrap/useDriverBootstrap'
import { useWorkspace } from '@/app/providers/workspace.context'
import { useRouteExecutionShell } from '../providers/routeExecutionShell.context'
import { selectRouteExecutionWorkspaceState } from '../stores/routeExecution.selectors'

export function useAssignedRouteController() {
  const bootstrap = useDriverBootstrap()
  const { workspace } = useWorkspace()
  const { store, initializeRouteWorkspace, submitRouteAction } = useRouteExecutionShell()

  const routeState = useSyncExternalStore(
    store.subscribe,
    () => selectRouteExecutionWorkspaceState(store.getState()),
    () => selectRouteExecutionWorkspaceState(store.getState()),
  )

  const refreshAssignedRoute = useCallback(async () => {
    await initializeRouteWorkspace()
  }, [initializeRouteWorkspace])

  const startRoute = useCallback(async () => {
    if (!routeState.route) {
      return
    }

    await submitRouteAction({
      type: 'start-route',
      routeClientId: routeState.route.routeClientId,
    })
  }, [routeState.route, submitRouteAction])

  return useMemo(() => ({
    bootstrap,
    workspace,
    routeState,
    refreshAssignedRoute,
    startRoute,
  }), [bootstrap, refreshAssignedRoute, routeState, startRoute, workspace])
}
