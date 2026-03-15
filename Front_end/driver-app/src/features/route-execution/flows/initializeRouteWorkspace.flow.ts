import type { DriverWorkspaceContext } from '@/app/contracts/driverSession.types'
import type { DriverOrderStateIds } from '@/features/order-states'
import { clearOrders, clearRoutes, initializeActiveRoutesFlow } from '@/features/routes'
import {
  resetRouteExecutionStore,
  setAssignedRoute,
  setRouteExecutionError,
  setRouteExecutionLoading,
} from '../stores/routeExecution.mutations'
import type { RouteExecutionStore } from '../stores/routeExecution.store'
import { mapActiveRoutesToAssignedRouteViewModel } from '../domain/mapActiveRoutesToAssignedRouteViewModel'

type InitializeRouteWorkspaceDependencies = {
  workspace: DriverWorkspaceContext | null
  store: RouteExecutionStore
  orderStateIds: DriverOrderStateIds
}

export async function initializeRouteWorkspaceFlow({
  workspace,
  store,
  orderStateIds,
}: InitializeRouteWorkspaceDependencies) {
  if (!workspace?.capabilities.canExecuteRoutes) {
    clearRoutes()
    clearOrders()
    resetRouteExecutionStore(store)
    return
  }

  setRouteExecutionLoading(store)

  try {
    const payload = await initializeActiveRoutesFlow({
      workspaceScopeKey: workspace.workspaceScopeKey,
    })
    const route = mapActiveRoutesToAssignedRouteViewModel(payload, orderStateIds)
    setAssignedRoute(store, route)
  } catch (error) {
    console.error('Failed to initialize route workspace', error)
    clearRoutes()
    clearOrders()
    setRouteExecutionError(store, 'Unable to load assigned route.')
  }
}
