import { useCallback, useMemo } from 'react'
import { useDriverAppShell } from '@/app/shell/providers/driverAppShell.context'
import { useRouteExecutionShell } from '../providers/routeExecutionShell.context'
import { mapStopDetailToPageDisplay } from '../domain/mapStopDetailToPageDisplay'
import { useSelectedAssignedRoute } from './useSelectedAssignedRoute.controller'

export function useStopDetailController(stopClientId?: string) {
  const { submitRouteAction } = useRouteExecutionShell()
  const { openSlidingPage } = useDriverAppShell()
  const route = useSelectedAssignedRoute()
  const stop = useMemo(
    () => route?.stops.find((candidate) => candidate.stopClientId === stopClientId) ?? null,
    [route, stopClientId],
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

  const pageDisplay = useMemo(() => {
    if (!route || !stop) {
      return null
    }

    return mapStopDetailToPageDisplay(route, stop, {
      openTestSlidingPage: (title) => openSlidingPage('test-sliding-page', { title }),
    })
  }, [openSlidingPage, route, stop])

  return useMemo(() => ({
    route,
    stop,
    sendAction,
    pageDisplay,
  }), [pageDisplay, route, sendAction, stop])
}
