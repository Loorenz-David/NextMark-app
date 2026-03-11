import type { SessionSnapshot } from '@shared-api'

export type DriverSessionState =
  | 'anonymous'
  | 'authenticating'
  | 'authenticated'
  | 'refreshing'
  | 'expired'

export type DriverBaseRole = 'team-driver' | 'independent-driver'

export type DriverCapabilities = {
  canExecuteRoutes: boolean
  canCreateRoutes: boolean
  canCreateOrders: boolean
  canSwitchMode: boolean
  canViewTeamAssignments: boolean
}

export type DriverWorkspaceScopeKey = string

export type DriverWorkspaceContext = {
  userId: string
  baseRole: DriverBaseRole
  teamId: string | null
  workspaceScopeKey: DriverWorkspaceScopeKey
  capabilities: DriverCapabilities
}

export type DriverBootstrapResult = {
  restoredSession: boolean
  hydratedWorkspace: boolean
}

export type ModeSwitchCommand = {
  targetBaseRole: DriverBaseRole
  targetTeamId: string | null
}

export type ModeSwitchResponse = {
  access_token: string
  refresh_token: string
  socket_token?: string
  user?: SessionSnapshot['user'] | null
}
