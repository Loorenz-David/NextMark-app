import type { Dispatch, SetStateAction } from 'react'

import type { VehicleFormState } from './VehicleForm.types'
import type { VehicleFormWarnings } from './VehicleForm.warnings'

export const useVehicleFormSetters = ({
  setFormState,
  warnings,
}: {
  setFormState: Dispatch<SetStateAction<VehicleFormState>>
  warnings: VehicleFormWarnings
}) => {
  const handleRegistrationNumber = (value: string) => {
    warnings.registrationNumberWarning.validate(value)
    setFormState((prev) => ({ ...prev, registration_number: value }))
  }
  const handleLabel = (value: string) => setFormState((prev) => ({ ...prev, label: value }))
  const handleFuelType = (value: string) => setFormState((prev) => ({ ...prev, fuel_type: value }))
  const handleTravelMode = (value: string) => setFormState((prev) => ({ ...prev, travel_mode: value }))
  const handleMaxVolumeLoadCm3 = (value: string) => setFormState((prev) => ({ ...prev, max_volume_load_cm3: value }))
  const handleMaxWeightLoadG = (value: string) => setFormState((prev) => ({ ...prev, max_weight_load_g: value }))
  const handleMaxSpeedKmh = (value: string) => setFormState((prev) => ({ ...prev, max_speed_kmh: value }))
  const handleCostPerKm = (value: string) => setFormState((prev) => ({ ...prev, cost_per_km: value }))
  const handleCostPerHour = (value: string) => setFormState((prev) => ({ ...prev, cost_per_hour: value }))
  const handleTravelDistanceLimitKm = (value: string) => setFormState((prev) => ({ ...prev, travel_distance_limit_km: value }))
  const handleTravelDurationLimitMinutes = (value: string) => setFormState((prev) => ({ ...prev, travel_duration_limit_minutes: value }))
  const handleIsSystem = (value: boolean) => setFormState((prev) => ({ ...prev, is_system: value }))

  return {
    handleRegistrationNumber,
    handleLabel,
    handleFuelType,
    handleTravelMode,
    handleMaxVolumeLoadCm3,
    handleMaxWeightLoadG,
    handleMaxSpeedKmh,
    handleCostPerKm,
    handleCostPerHour,
    handleTravelDistanceLimitKm,
    handleTravelDurationLimitMinutes,
    handleIsSystem,
  }
}
