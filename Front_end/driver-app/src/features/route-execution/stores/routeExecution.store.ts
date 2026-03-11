import type {
  AssignedRouteViewModel,
  DriverCommandEnvelope,
  DriverRouteActionCommand,
  SyncExecutionState,
} from '@/app/contracts/routeExecution.types'

export type RouteExecutionWorkspaceState = {
  status: 'idle' | 'loading' | 'ready' | 'error'
  route: AssignedRouteViewModel | null
  error?: string
  lastCommand?: DriverCommandEnvelope<DriverRouteActionCommand>
  syncState: SyncExecutionState
}

export type RouteExecutionStoreState = {
  workspace: RouteExecutionWorkspaceState
}

export type RouteExecutionStore = ReturnType<typeof createRouteExecutionStore>

type Listener = () => void
type StateUpdater = RouteExecutionStoreState | ((state: RouteExecutionStoreState) => RouteExecutionStoreState)

export function createInitialRouteExecutionWorkspaceState(): RouteExecutionWorkspaceState {
  return {
    status: 'idle',
    route: null,
    syncState: 'idle',
  }
}

export function createInitialRouteExecutionStoreState(): RouteExecutionStoreState {
  return {
    workspace: createInitialRouteExecutionWorkspaceState(),
  }
}

export function createRouteExecutionStore(
  initialState: RouteExecutionStoreState = createInitialRouteExecutionStoreState(),
) {
  let state = initialState
  const listeners = new Set<Listener>()

  const getState = () => state

  const setState = (updater: StateUpdater) => {
    state = typeof updater === 'function' ? updater(state) : updater
    listeners.forEach((listener) => listener())
  }

  const subscribe = (listener: Listener) => {
    listeners.add(listener)
    return () => listeners.delete(listener)
  }

  return {
    getState,
    setState,
    subscribe,
  }
}
