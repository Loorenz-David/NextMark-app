export type VehicleSelectorProps = {
  selectedVehicle: number | null | undefined
  onSelectVehicle: (vehicleId: number | null) => void
}

export type VehicleSelectorContextValue = {
  isOpen: boolean
  inputValue: string
  selectedVehicleId: number | null | undefined
  selectedLabel: string | null
  handleOpenChange: (isOpen: boolean) => void
  handleInputFocus: () => void
  handleInputChange: (event: React.ChangeEvent<HTMLInputElement>) => void
  handleSelectVehicle: (vehicleId: number, label: string) => void
  handleClearVehicle: () => void
  filteredOptions: Array<{ id: number; label: string; registration_number: string }>
}
