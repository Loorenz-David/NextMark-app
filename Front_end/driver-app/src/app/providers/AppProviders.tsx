import type { PropsWithChildren } from 'react'
import { DriverAppShellProvider } from '@/app/shell'
import { ConnectivityProvider } from './ConnectivityProvider'
import { DriverServicesProvider } from './DriverServicesProvider'
import { RouteExecutionShellProvider } from '@/features/route-execution'
import { SessionProvider } from './SessionProvider'
import { WorkspaceProvider } from './WorkspaceProvider'
import { useWorkspace } from './workspace.context'

function WorkspaceScopedProviders({ children }: PropsWithChildren) {
  const { workspace } = useWorkspace()
  const workspaceScopeKey = workspace?.workspaceScopeKey ?? 'anonymous'

  return (
    <RouteExecutionShellProvider key={workspaceScopeKey}>
      <DriverAppShellProvider key={workspaceScopeKey}>
        {children}
      </DriverAppShellProvider>
    </RouteExecutionShellProvider>
  )
}

export function AppProviders({ children }: PropsWithChildren) {
  return (
    <ConnectivityProvider>
      <DriverServicesProvider>
        <SessionProvider>
          <WorkspaceProvider>
            <WorkspaceScopedProviders>{children}</WorkspaceScopedProviders>
          </WorkspaceProvider>
        </SessionProvider>
      </DriverServicesProvider>
    </ConnectivityProvider>
  )
}
