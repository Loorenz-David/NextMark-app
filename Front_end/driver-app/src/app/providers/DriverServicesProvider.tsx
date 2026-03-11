import type { PropsWithChildren } from 'react'
import { useMemo } from 'react'
import { authApi } from '../services/auth.api'
import { browserLocationService } from '../services/browserLocation.service'
import { driverModeApi } from '../services/driverMode.api'
import { independentDriverApi } from '../services/independentDriver.api'
import { routeExecutionApi } from '../services/routeExecution.api'
import { DriverServicesContext } from './driverServices.context'

export function DriverServicesProvider({ children }: PropsWithChildren) {
  const value = useMemo(() => ({
    authApi,
    browserLocationService,
    driverModeApi,
    routeExecutionApi,
    independentDriverApi,
  }), [])

  return (
    <DriverServicesContext.Provider value={value}>
      {children}
    </DriverServicesContext.Provider>
  )
}
