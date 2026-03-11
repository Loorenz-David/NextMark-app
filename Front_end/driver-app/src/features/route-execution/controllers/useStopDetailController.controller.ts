import { useCallback, useMemo, useSyncExternalStore } from 'react'
import { useRouteExecutionShell } from '../providers/routeExecutionShell.context'
import {
  selectAssignedRoute,
  selectAssignedStopByClientId,
} from '../stores/routeExecution.selectors'

export function useStopDetailController(stopClientId?: string) {
  const { store, submitRouteAction } = useRouteExecutionShell()

  const route = useSyncExternalStore(
    store.subscribe,
    () => selectAssignedRoute(store.getState()),
    () => selectAssignedRoute(store.getState()),
  )

  const stop = useSyncExternalStore(
    store.subscribe,
    () => selectAssignedStopByClientId(store.getState(), stopClientId),
    () => selectAssignedStopByClientId(store.getState(), stopClientId),
  )

  const sendAction = useCallback(async (type: 'arrive-stop' | 'complete-stop' | 'skip-stop') => {
    if (!route || !stop) {
      return
    }

    await submitRouteAction({
      type,
      routeClientId: route.routeClientId,
      stopClientId: stop.stopClientId,
    })
  }, [route, stop, submitRouteAction])

  return useMemo(() => ({
    route,
    stop,
    sendAction,
  }), [route, sendAction, stop])
}
