import type { PropsWithChildren } from 'react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import type { DriverRouteActionCommand } from '@/app/contracts/routeExecution.types'
import { useWorkspace } from '@/app/providers/workspace.context'
import { initializeRouteWorkspaceFlow } from '../flows/initializeRouteWorkspace.flow'
import { submitRouteActionFlow } from '../flows/submitRouteAction.flow'
import {
  createInitialRouteExecutionStoreState,
  createRouteExecutionStore,
} from '../stores/routeExecution.store'
import { RouteExecutionShellContext } from './routeExecutionShell.context'

export function RouteExecutionShellProvider({ children }: PropsWithChildren) {
  const { workspace } = useWorkspace()
  const [store] = useState(() => createRouteExecutionStore(createInitialRouteExecutionStoreState()))

  const initializeRouteWorkspace = useCallback(async () => {
    await initializeRouteWorkspaceFlow({
      workspace,
      store,
    })
  }, [store, workspace])

  const submitRouteAction = useCallback(async (command: DriverRouteActionCommand) => submitRouteActionFlow({
    workspace,
    store,
    command,
  }), [store, workspace])

  useEffect(() => {
    queueMicrotask(() => {
      void initializeRouteWorkspace()
    })
  }, [initializeRouteWorkspace])

  const value = useMemo(() => ({
    store,
    initializeRouteWorkspace,
    submitRouteAction,
  }), [initializeRouteWorkspace, store, submitRouteAction])

  return <RouteExecutionShellContext.Provider value={value}>{children}</RouteExecutionShellContext.Provider>
}
