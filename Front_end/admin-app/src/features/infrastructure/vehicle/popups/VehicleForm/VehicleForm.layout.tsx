import { useMemo } from 'react'

import { Field } from '@/shared/inputs/FieldContainer'
import { InputField } from '@/shared/inputs/InputField'
import { InputWarning } from '@/shared/inputs/InputWarning'
import { Switch } from '@/shared/inputs/Switch'
import { PopupFooter } from '@/shared/popups/MainPopup/PopupFooter'

import { useVehicleForm } from './VehicleForm.context'
import { useVehicleFormConfig } from './useVehicleFormConfig'
import { useVehicleFormSetters } from './useVehicleFormSetters'

const FUEL_TYPE_OPTIONS = [
  { value: '', label: 'None' },
  { value: 'bensine', label: 'Bensine' },
  { value: 'diesel', label: 'Diesel' },
  { value: 'electric', label: 'Electric' },
]

const TRAVEL_MODE_OPTIONS = [
  { value: '', label: 'None' },
  { value: 'DRIVING', label: 'Driving' },
  { value: 'TWO_WHEELER', label: 'Two-Wheeler' },
  { value: 'BICYCLING', label: 'Bicycling' },
  { value: 'WALKING', label: 'Walking' },
]

export const VehicleFormLayout = () => {
  const { payload, formState, warnings, setFormState, handleSave, initialFormRef } = useVehicleForm()
  const setters = useVehicleFormSetters({ setFormState, warnings })

  useVehicleFormConfig({ formState, initialFormRef, payload })

  const footerConfig = useMemo(
    () => ({
      saveButton: { label: payload.mode === 'create' ? 'Create' : 'Save', action: handleSave },
    }),
    [handleSave, payload.mode],
  )

  return (
    <>
      <form className="flex h-full flex-col gap-4 overflow-y-auto overflow-x-hidden pb-[40px] px-2 scroll-thin">
        <Field label="Registration number:" required={true}>
          <InputField
            value={formState.registration_number}
            onChange={(event) => setters.handleRegistrationNumber(event.target.value)}
            warningController={warnings.registrationNumberWarning}
            placeholder="e.g. AB-123-CD"
          />
        </Field>
        {warnings.registrationNumberWarning.warning.isVisible && (
          <InputWarning {...warnings.registrationNumberWarning.warning} />
        )}

        <Field label="Label:">
          <InputField
            value={formState.label}
            onChange={(event) => setters.handleLabel(event.target.value)}
            placeholder="e.g. Delivery van"
          />
        </Field>

        <Field label="Fuel type:">
          <select
            className="custom-field-container w-full rounded-xl px-3 py-2 text-sm"
            value={formState.fuel_type}
            onChange={(event) => setters.handleFuelType(event.target.value)}
          >
            {FUEL_TYPE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </Field>

        <Field label="Travel mode:">
          <select
            className="custom-field-container w-full rounded-xl px-3 py-2 text-sm"
            value={formState.travel_mode}
            onChange={(event) => setters.handleTravelMode(event.target.value)}
          >
            {TRAVEL_MODE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </Field>

        <Field label="Max volume (cm³):">
          <InputField
            type="number"
            value={formState.max_volume_load_cm3}
            onChange={(event) => setters.handleMaxVolumeLoadCm3(event.target.value)}
          />
        </Field>

        <Field label="Max weight (g):">
          <InputField
            type="number"
            value={formState.max_weight_load_g}
            onChange={(event) => setters.handleMaxWeightLoadG(event.target.value)}
          />
        </Field>

        <Field label="Max speed (km/h):">
          <InputField
            type="number"
            value={formState.max_speed_kmh}
            onChange={(event) => setters.handleMaxSpeedKmh(event.target.value)}
          />
        </Field>

        <Field label="Cost per km:">
          <InputField
            type="number"
            value={formState.cost_per_km}
            onChange={(event) => setters.handleCostPerKm(event.target.value)}
          />
        </Field>

        <Field label="Cost per hour:">
          <InputField
            type="number"
            value={formState.cost_per_hour}
            onChange={(event) => setters.handleCostPerHour(event.target.value)}
          />
        </Field>

        <Field label="Distance limit (km):">
          <InputField
            type="number"
            value={formState.travel_distance_limit_km}
            onChange={(event) => setters.handleTravelDistanceLimitKm(event.target.value)}
          />
        </Field>

        <Field label="Duration limit (min):">
          <InputField
            type="number"
            value={formState.travel_duration_limit_minutes}
            onChange={(event) => setters.handleTravelDurationLimitMinutes(event.target.value)}
          />
        </Field>

        <Field label="System vehicle:">
          <Switch value={formState.is_system} onChange={setters.handleIsSystem} />
        </Field>
      </form>
      <PopupFooter footerConfig={footerConfig} />
    </>
  )
}
