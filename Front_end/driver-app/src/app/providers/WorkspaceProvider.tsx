import type { PropsWithChildren } from 'react'
import { useCallback, useMemo, useState } from 'react'
import type { ModeSwitchCommand } from '../contracts/driverSession.types'
import { buildWorkspaceContext } from '../lib/driverWorkspace'
import { useDriverServices } from './driverServices.context'
import { useSession } from './session.context'
import { WorkspaceContext } from './workspace.context'

export function WorkspaceProvider({ children }: PropsWithChildren) {
  const { session, applyTokenResponse } = useSession()
  const { driverModeApi } = useDriverServices()
  const [isSwitchingMode, setIsSwitchingMode] = useState(false)
  const [switchError, setSwitchError] = useState<string>()

  const workspace = useMemo(() => buildWorkspaceContext(session), [session])

  const switchMode = useCallback(async (command: ModeSwitchCommand) => {
    setIsSwitchingMode(true)
    setSwitchError(undefined)

    try {
      const response = await driverModeApi.switchMode(command)
      if (!response.data?.access_token || !response.data?.refresh_token) {
        setSwitchError('Mode switch did not return updated session tokens.')
        return false
      }

      applyTokenResponse(response.data)
      return true
    } catch (error) {
      console.error('Failed to switch driver mode', error)
      setSwitchError('Unable to switch mode.')
      return false
    } finally {
      setIsSwitchingMode(false)
    }
  }, [applyTokenResponse, driverModeApi])

  const value = useMemo(() => ({
    workspace,
    isSwitchingMode,
    switchError,
    switchMode,
  }), [isSwitchingMode, switchError, switchMode, workspace])

  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>
}
