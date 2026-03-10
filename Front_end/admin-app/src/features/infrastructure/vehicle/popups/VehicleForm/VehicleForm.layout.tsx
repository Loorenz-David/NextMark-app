import { useMemo } from 'react'

import { Field } from '@/shared/inputs/FieldContainer'
import { InputField } from '@/shared/inputs/InputField'
import { InputWarning } from '@/shared/inputs/InputWarning'
import { Switch } from '@/shared/inputs/Switch'
import { PopupFooter } from '@/shared/popups/MainPopup/PopupFooter'

import { useVehicleForm } from './VehicleForm.context'
import { useVehicleFormConfig } from './useVehicleFormConfig'
import { useVehicleFormSetters } from './useVehicleFormSetters'

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
        <Field label="Name:" required={true}>
          <InputField
            value={formState.name}
            onChange={(event) => setters.handleName(event.target.value)}
            warningController={warnings.nameWarning}
          />
        </Field>
        {warnings.nameWarning.warning.isVisible ? (
          <InputWarning {...warnings.nameWarning.warning} />
        ) : null}

        <Field label="Icon:">
          <InputField value={formState.icon} onChange={(event) => setters.handleIcon(event.target.value)} />
        </Field>

        <Field label="Travel mode:">
          <InputField value={formState.travel_mode} onChange={(event) => setters.handleTravelMode(event.target.value)} />
        </Field>

        <Field label="Cost per hour:">
          <InputField type="number" value={formState.cost_per_hour} onChange={(event) => setters.handleCostPerHour(event.target.value)} />
        </Field>

        <Field label="Cost per kilometer:">
          <InputField
            type="number"
            value={formState.cost_per_kilometer}
            onChange={(event) => setters.handleCostPerKilometer(event.target.value)}
          />
        </Field>

        <Field label="Travel duration limit:">
          <InputField
            type="number"
            value={formState.travel_duration_limit}
            onChange={(event) => setters.handleTravelDurationLimit(event.target.value)}
          />
        </Field>

        <Field label="Route distance limit:">
          <InputField
            type="number"
            value={formState.route_distance_limit}
            onChange={(event) => setters.handleRouteDistanceLimit(event.target.value)}
          />
        </Field>

        <Field label="Driver user id:">
          <InputField type="number" value={formState.user_id} onChange={(event) => setters.handleUserId(event.target.value)} />
        </Field>

        <Field label="Max load:">
          <InputField type="number" value={formState.max_load} onChange={(event) => setters.handleMaxLoad(event.target.value)} />
        </Field>

        <Field label="Min load:">
          <InputField type="number" value={formState.min_load} onChange={(event) => setters.handleMinLoad(event.target.value)} />
        </Field>

        <Field label="System:">
          <Switch value={formState.is_system} onChange={setters.handleIsSystem} />
        </Field>
      </form>
      <PopupFooter footerConfig={footerConfig} />
    </>
  )
}
