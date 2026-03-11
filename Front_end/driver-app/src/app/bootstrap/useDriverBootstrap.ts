import { useMemo } from 'react'
import type { DriverBootstrapResult } from '../contracts/driverSession.types'
import { useRouteExecutionBootstrapStateController } from '@/features/route-execution'
import { useSession } from '../providers/session.context'
import { useWorkspace } from '../providers/workspace.context'

export const useDriverBootstrap = (): DriverBootstrapResult => {
  const { session } = useSession()
  const { workspace } = useWorkspace()
  const routeState = useRouteExecutionBootstrapStateController()

  return useMemo(() => ({
    restoredSession: Boolean(session),
    hydratedWorkspace: workspace ? routeState.status !== 'loading' : false,
  }), [routeState.status, session, workspace])
}
