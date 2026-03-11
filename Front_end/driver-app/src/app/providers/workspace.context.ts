import { createContext, useContext } from 'react'
import type { DriverWorkspaceContext, ModeSwitchCommand } from '../contracts/driverSession.types'

export type WorkspaceContextValue = {
  workspace: DriverWorkspaceContext | null
  isSwitchingMode: boolean
  switchError?: string
  switchMode: (command: ModeSwitchCommand) => Promise<boolean>
}

export const WorkspaceContext = createContext<WorkspaceContextValue | null>(null)

export function useWorkspace() {
  const context = useContext(WorkspaceContext)
  if (!context) {
    throw new Error('useWorkspace must be used within WorkspaceProvider')
  }
  return context
}
