import type { RouteExecutionStoreState, RouteExecutionWorkspaceState } from './routeExecution.store'

export function selectRouteExecutionWorkspaceState(
  state: RouteExecutionStoreState,
): RouteExecutionWorkspaceState {
  return state.workspace
}

export function selectAssignedRoute(state: RouteExecutionStoreState) {
  return state.workspace.route
}

export function selectAssignedStopByClientId(
  state: RouteExecutionStoreState,
  stopClientId?: string,
) {
  if (!stopClientId) {
    return null
  }

  return state.workspace.route?.stops.find((stop) => stop.stopClientId === stopClientId) ?? null
}
