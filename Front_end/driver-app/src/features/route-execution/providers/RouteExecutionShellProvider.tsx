import type { PropsWithChildren } from 'react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import type { DriverRouteActionCommand } from '@/app/contracts/routeExecution.types'
import { useWorkspace } from '@/app/providers/workspace.context'
import { useDriverOrderStateRegistry } from '@/features/order-states'
import { initializeRouteWorkspaceFlow } from '../flows/initializeRouteWorkspace.flow'
import { submitRouteActionFlow } from '../flows/submitRouteAction.flow'
import {
  createInitialRouteExecutionStoreState,
  createRouteExecutionStore,
} from '../stores/routeExecution.store'
import { RouteExecutionShellContext } from './routeExecutionShell.context'

export function RouteExecutionShellProvider({ children }: PropsWithChildren) {
  const { workspace } = useWorkspace()
  const orderStateRegistry = useDriverOrderStateRegistry()
  const [store] = useState(() => createRouteExecutionStore(createInitialRouteExecutionStoreState()))
  const [stopDetailTransitionDirection, setStopDetailTransitionDirection] = useState<'forward' | 'backward'>('forward')
  const [lastOpenedStopClientId, setLastOpenedStopClientId] = useState<string | null>(null)
  const [routeViewMode, setRouteViewMode] = useState<'route' | 'search'>('route')
  const [routeSearchQuery, setRouteSearchQuery] = useState('')

  const initializeRouteWorkspace = useCallback(async () => {
    await initializeRouteWorkspaceFlow({
      workspace,
      store,
      orderStateIds: {
        processingId: orderStateRegistry.getStateIdByName('Processing'),
        completedId: orderStateRegistry.getStateIdByName('Completed'),
        failId: orderStateRegistry.getStateIdByName('Fail'),
      },
    })
  }, [orderStateRegistry, store, workspace])

  const submitRouteAction = useCallback(async (command: DriverRouteActionCommand) => submitRouteActionFlow({
    workspace,
    store,
    command,
    orderStateIds: {
      processingId: orderStateRegistry.getStateIdByName('Processing'),
      completedId: orderStateRegistry.getStateIdByName('Completed'),
      failId: orderStateRegistry.getStateIdByName('Fail'),
    },
  }), [orderStateRegistry, store, workspace])

  useEffect(() => {
    queueMicrotask(() => {
      void initializeRouteWorkspace()
    })
  }, [initializeRouteWorkspace])

  const resetRouteSearchQuery = useCallback(() => {
    setRouteSearchQuery('')
  }, [])

  const prepareRouteStopDetailTransition = useCallback((stopClientId: string) => {
    const assignedRoute = store.getState().workspace.route
    const previousStopClientId = lastOpenedStopClientId

    if (previousStopClientId === stopClientId) {
      return false
    }

    const previousIndex = previousStopClientId
      ? assignedRoute?.stops.findIndex((candidate) => candidate.stopClientId === previousStopClientId) ?? -1
      : -1
    const nextIndex = assignedRoute?.stops.findIndex((candidate) => candidate.stopClientId === stopClientId) ?? -1

    setStopDetailTransitionDirection(previousIndex >= 0 && nextIndex >= 0 && nextIndex < previousIndex ? 'backward' : 'forward')
    setLastOpenedStopClientId(stopClientId)
    return true
  }, [lastOpenedStopClientId, store])

  const openRouteSearch = useCallback(() => {
    setRouteViewMode('search')
  }, [])

  const closeRouteSearch = useCallback(() => {
    const activeElement = document.activeElement
    if (activeElement instanceof HTMLElement) {
      activeElement.blur()
    }

    setRouteViewMode('route')
    setRouteSearchQuery('')
  }, [])

  const value = useMemo(() => ({
    store,
    initializeRouteWorkspace,
    submitRouteAction,
    stopDetailTransitionDirection,
    prepareRouteStopDetailTransition,
    routeViewMode,
    openRouteSearch,
    closeRouteSearch,
    routeSearchQuery,
    setRouteSearchQuery,
    resetRouteSearchQuery,
  }), [
    closeRouteSearch,
    initializeRouteWorkspace,
    openRouteSearch,
    prepareRouteStopDetailTransition,
    resetRouteSearchQuery,
    routeSearchQuery,
    routeViewMode,
    stopDetailTransitionDirection,
    store,
    submitRouteAction,
  ])

  return <RouteExecutionShellContext.Provider value={value}>{children}</RouteExecutionShellContext.Provider>
}
