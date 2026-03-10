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
  const handleName = (value: string) => {
    warnings.nameWarning.validate(value)
    setFormState((prev) => ({ ...prev, name: value }))
  }

  const handleIcon = (value: string) => setFormState((prev) => ({ ...prev, icon: value }))
  const handleTravelMode = (value: string) => setFormState((prev) => ({ ...prev, travel_mode: value }))
  const handleCostPerHour = (value: string) => setFormState((prev) => ({ ...prev, cost_per_hour: value }))
  const handleCostPerKilometer = (value: string) =>
    setFormState((prev) => ({ ...prev, cost_per_kilometer: value }))
  const handleTravelDurationLimit = (value: string) =>
    setFormState((prev) => ({ ...prev, travel_duration_limit: value }))
  const handleRouteDistanceLimit = (value: string) =>
    setFormState((prev) => ({ ...prev, route_distance_limit: value }))
  const handleUserId = (value: string) => setFormState((prev) => ({ ...prev, user_id: value }))
  const handleMaxLoad = (value: string) => setFormState((prev) => ({ ...prev, max_load: value }))
  const handleMinLoad = (value: string) => setFormState((prev) => ({ ...prev, min_load: value }))
  const handleIsSystem = (value: boolean) => setFormState((prev) => ({ ...prev, is_system: value }))

  return {
    handleName,
    handleIcon,
    handleTravelMode,
    handleCostPerHour,
    handleCostPerKilometer,
    handleTravelDurationLimit,
    handleRouteDistanceLimit,
    handleUserId,
    handleMaxLoad,
    handleMinLoad,
    handleIsSystem,
  }
}
