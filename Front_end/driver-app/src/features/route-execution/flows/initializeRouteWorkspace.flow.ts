import type { DriverWorkspaceContext } from '@/app/contracts/driverSession.types'
import { loadAssignedRouteQuery } from '../actions/loadAssignedRoute.query'
import {
  resetRouteExecutionStore,
  setAssignedRoute,
  setRouteExecutionError,
  setRouteExecutionLoading,
} from '../stores/routeExecution.mutations'
import type { RouteExecutionStore } from '../stores/routeExecution.store'

type InitializeRouteWorkspaceDependencies = {
  workspace: DriverWorkspaceContext | null
  store: RouteExecutionStore
}

export async function initializeRouteWorkspaceFlow({
  workspace,
  store,
}: InitializeRouteWorkspaceDependencies) {
  if (!workspace?.capabilities.canExecuteRoutes) {
    resetRouteExecutionStore(store)
    return
  }

  setRouteExecutionLoading(store)

  try {
    const route = await loadAssignedRouteQuery()
    setAssignedRoute(store, route)
  } catch (error) {
    console.error('Failed to initialize route workspace', error)
    setRouteExecutionError(store, 'Unable to load assigned route.')
  }
}
