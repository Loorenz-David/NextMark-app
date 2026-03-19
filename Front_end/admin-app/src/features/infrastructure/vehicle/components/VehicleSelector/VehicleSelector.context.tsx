import { createContext, useContext } from 'react'
import type { VehicleSelectorContextValue } from './VehicleSelector.types'

export const VehicleSelectorContext = createContext<VehicleSelectorContextValue | null>(null)

export const useVehicleSelectorContext = () => {
  const ctx = useContext(VehicleSelectorContext)
  if (!ctx) throw new Error('useVehicleSelectorContext must be used inside VehicleSelectorProvider')
  return ctx
}
