export type VehicleSelectorProps = {
  selectedVehicle: number | null | undefined
  onSelectVehicle: (vehicleId: number | null) => void
  placeholder?: string
  containerClassName?: string
}
