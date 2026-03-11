import type { SessionSnapshot } from '@shared-api'
import type { DriverBaseRole, DriverCapabilities, DriverWorkspaceContext, DriverWorkspaceScopeKey } from '../contracts/driverSession.types'

const TEAM_DRIVER_ROLE: DriverBaseRole = 'team-driver'
const INDEPENDENT_DRIVER_ROLE: DriverBaseRole = 'independent-driver'

const resolveBaseRoleFromUnknown = (value: unknown): DriverBaseRole | null => {
  if (value === TEAM_DRIVER_ROLE || value === INDEPENDENT_DRIVER_ROLE) {
    return value
  }

  return null
}

export const resolveDriverBaseRole = (session: SessionSnapshot | null): DriverBaseRole => {
  const explicitRole =
    resolveBaseRoleFromUnknown(session?.user?.driver_base_role)
    ?? resolveBaseRoleFromUnknown(session?.identity?.driver_base_role)
    ?? resolveBaseRoleFromUnknown(session?.user?.base_role)
    ?? resolveBaseRoleFromUnknown(session?.identity?.base_role)

  if (explicitRole) {
    return explicitRole
  }

  return session?.user?.teamId != null || session?.identity?.team_id != null
    ? TEAM_DRIVER_ROLE
    : INDEPENDENT_DRIVER_ROLE
}

export const resolveTeamId = (session: SessionSnapshot | null): string | null => {
  const raw = session?.identity?.team_id ?? session?.user?.teamId ?? null
  if (raw == null) return null
  const normalized = String(raw).trim()
  return normalized || null
}

export const buildCapabilities = (baseRole: DriverBaseRole): DriverCapabilities => {
  if (baseRole === INDEPENDENT_DRIVER_ROLE) {
    return {
      canExecuteRoutes: true,
      canCreateRoutes: true,
      canCreateOrders: true,
      canSwitchMode: true,
      canViewTeamAssignments: false,
    }
  }

  return {
    canExecuteRoutes: true,
    canCreateRoutes: false,
    canCreateOrders: false,
    canSwitchMode: true,
    canViewTeamAssignments: true,
  }
}

export const buildWorkspaceScopeKey = (
  userId: string,
  baseRole: DriverBaseRole,
  teamId: string | null,
): DriverWorkspaceScopeKey => `${userId}:${baseRole}:${teamId ?? 'no-team'}`

export const buildWorkspaceContext = (
  session: SessionSnapshot | null,
): DriverWorkspaceContext | null => {
  if (!session?.accessToken) return null

  const userId = String(
    session.user?.id
    ?? session.identity?.user_id
    ?? 'anonymous-driver',
  )

  const baseRole = resolveDriverBaseRole(session)
  const teamId = resolveTeamId(session)
  const capabilities = buildCapabilities(baseRole)

  return {
    userId,
    baseRole,
    teamId,
    workspaceScopeKey: buildWorkspaceScopeKey(userId, baseRole, teamId),
    capabilities,
  }
}
