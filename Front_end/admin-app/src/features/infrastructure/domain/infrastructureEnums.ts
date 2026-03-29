import {
  facilityTypeOptions,
  infrastructureEnumMaps,
  operatingDayOptions,
  vehicleCapabilityOptions,
  vehicleFuelTypeOptions,
  vehicleStatusOptions,
  vehicleTravelModeOptions,
  type FacilityType,
  type OperatingDay,
  type VehicleCapability,
  type VehicleFuelType,
  type VehicleStatus,
  type VehicleTravelMode,
} from '../../../../docs/handoff_from_backend/infrastructure-enum-options'

export {
  facilityTypeOptions,
  infrastructureEnumMaps,
  operatingDayOptions,
  vehicleCapabilityOptions,
  vehicleFuelTypeOptions,
  vehicleStatusOptions,
  vehicleTravelModeOptions,
  type FacilityType,
  type OperatingDay,
  type VehicleCapability,
  type VehicleFuelType,
  type VehicleStatus,
  type VehicleTravelMode,
}

const buildValueSet = <TValue extends string>(options: ReadonlyArray<{ value: TValue }>) =>
  new Set(options.map((option) => option.value))

export const facilityTypeValueSet = buildValueSet(facilityTypeOptions)
export const operatingDayValueSet = buildValueSet(operatingDayOptions)
export const vehicleFuelTypeValueSet = buildValueSet(vehicleFuelTypeOptions)
export const vehicleTravelModeValueSet = buildValueSet(vehicleTravelModeOptions)
export const vehicleStatusValueSet = buildValueSet(vehicleStatusOptions)
export const vehicleCapabilityValueSet = buildValueSet(vehicleCapabilityOptions)
