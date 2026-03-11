import { createContext, useContext } from 'react'
import { authApi } from '../services/auth.api'
import { browserLocationService } from '../services/browserLocation.service'
import { driverModeApi } from '../services/driverMode.api'
import { independentDriverApi } from '../services/independentDriver.api'
import { routeExecutionApi } from '../services/routeExecution.api'

export type DriverServices = {
  authApi: typeof authApi
  browserLocationService: typeof browserLocationService
  driverModeApi: typeof driverModeApi
  routeExecutionApi: typeof routeExecutionApi
  independentDriverApi: typeof independentDriverApi
}

export const DriverServicesContext = createContext<DriverServices | null>(null)

export function useDriverServices() {
  const context = useContext(DriverServicesContext)
  if (!context) {
    throw new Error('useDriverServices must be used within DriverServicesProvider')
  }
  return context
}
