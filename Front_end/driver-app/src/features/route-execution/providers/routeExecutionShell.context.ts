import { createContext, useContext } from 'react'
import type { DriverRouteActionCommand, DriverRouteActionResult } from '@/app/contracts/routeExecution.types'
import type { RouteExecutionStore } from '../stores/routeExecution.store'

type RouteExecutionShellContextValue = {
  store: RouteExecutionStore
  initializeRouteWorkspace: () => Promise<void>
  submitRouteAction: (command: DriverRouteActionCommand) => Promise<DriverRouteActionResult>
}

export const RouteExecutionShellContext = createContext<RouteExecutionShellContextValue | null>(null)

export function useRouteExecutionShell() {
  const context = useContext(RouteExecutionShellContext)
  if (!context) {
    throw new Error('useRouteExecutionShell must be used within RouteExecutionShellProvider')
  }
  return context
}
