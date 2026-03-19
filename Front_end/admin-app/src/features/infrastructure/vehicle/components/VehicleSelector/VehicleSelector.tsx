import { VehicleSelectorLayout } from './VehicleSelector.layout'
import { VehicleSelectorProvider } from './VehicleSelector.provider'
import type { VehicleSelectorProps } from './VehicleSelector.types'

export const VehicleSelector = ({ selectedVehicle, onSelectVehicle }: VehicleSelectorProps) => {
  return (
    <VehicleSelectorProvider selectedVehicle={selectedVehicle} onSelectVehicle={onSelectVehicle}>
      <VehicleSelectorLayout />
    </VehicleSelectorProvider>
  )
}
