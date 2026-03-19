import type { ReactNode } from 'react'

import { VehicleSelectorContext } from './VehicleSelector.context'
import { useVehicleSelectorControllers } from './VehicleSelector.controllers'
import type { VehicleSelectorProps } from './VehicleSelector.types'

type Props = VehicleSelectorProps & { children: ReactNode }

export const VehicleSelectorProvider = ({ children, selectedVehicle, onSelectVehicle }: Props) => {
  const controllers = useVehicleSelectorControllers({ selectedVehicle, onSelectVehicle })

  return (
    <VehicleSelectorContext.Provider value={{ ...controllers, selectedVehicleId: selectedVehicle }}>
      {children}
    </VehicleSelectorContext.Provider>
  )
}
