import type {
  DriverCommandEnvelope,
  DriverRouteActionCommand,
  DriverRouteActionResult,
} from '@/app/contracts/routeExecution.types'
import type { RouteExecutionStore } from './routeExecution.store'
import { createInitialRouteExecutionWorkspaceState } from './routeExecution.store'

export function setRouteExecutionLoading(store: RouteExecutionStore) {
  store.setState((state) => ({
    ...state,
    workspace: {
      ...state.workspace,
      status: 'loading',
      error: undefined,
    },
  }))
}

export function setAssignedRoute(store: RouteExecutionStore, route: DriverRouteActionResult['route']) {
  store.setState(() => ({
    workspace: {
      status: 'ready',
      route: route ?? null,
      syncState: 'idle',
      error: undefined,
    },
  }))
}

export function setRouteExecutionError(store: RouteExecutionStore, error: string) {
  store.setState((state) => ({
    ...state,
    workspace: {
      ...state.workspace,
      status: 'error',
      error,
    },
  }))
}

export function setRouteActionSubmitting(
  store: RouteExecutionStore,
  envelope: DriverCommandEnvelope<DriverRouteActionCommand>,
) {
  store.setState((state) => ({
    ...state,
    workspace: {
      ...state.workspace,
      syncState: 'submitting',
      lastCommand: envelope,
      error: undefined,
    },
  }))
}

export function applyRouteActionResult(
  store: RouteExecutionStore,
  envelope: DriverCommandEnvelope<DriverRouteActionCommand>,
  result: DriverRouteActionResult,
) {
  store.setState((state) => ({
    ...state,
    workspace: {
      ...state.workspace,
      status: 'ready',
      route: result.route ?? state.workspace.route ?? null,
      syncState: result.syncState,
      error: undefined,
      lastCommand: envelope,
    },
  }))
}

export function setRouteActionFailure(
  store: RouteExecutionStore,
  envelope: DriverCommandEnvelope<DriverRouteActionCommand>,
  error: string,
) {
  store.setState((state) => ({
    ...state,
    workspace: {
      ...state.workspace,
      syncState: 'retryable_failure',
      error,
      lastCommand: envelope,
    },
  }))
}

export function resetRouteExecutionStore(store: RouteExecutionStore) {
  store.setState({
    workspace: createInitialRouteExecutionWorkspaceState(),
  })
}
