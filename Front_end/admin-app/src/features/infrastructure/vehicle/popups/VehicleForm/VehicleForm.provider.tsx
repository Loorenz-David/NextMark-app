import type { ReactNode } from 'react'
import { useEffect, useMemo, useRef, useState } from 'react'

import { makeInitialFormCopy } from '@shared-domain'

import { useVehicleByClientId } from '../../hooks/useVehicleSelectors'

import { VehicleFormContextProvider } from './VehicleForm.context'
import type { VehicleFormPayload, VehicleFormState } from './VehicleForm.types'
import { useVehicleFormWarnings } from './VehicleForm.warnings'
import { useVehicleFormValidation } from './VehicleForm.validation'
import { useVehicleFormSubmit } from './useVehicleFormSubmit'

const toStringValue = (value: number | string | null | undefined) =>
  value === null || value === undefined ? '' : String(value)

const buildInitialForm = (
  payload: VehicleFormPayload,
  state?: {
    registration_number?: string
    label?: string | null
    fuel_type?: string | null
    travel_mode?: string | null
    max_volume_load_cm3?: number | null
    max_weight_load_g?: number | null
    max_speed_kmh?: number | null
    cost_per_km?: number | null
    cost_per_hour?: number | null
    travel_distance_limit_km?: number | null
    travel_duration_limit_minutes?: number | null
    is_system?: boolean
  },
): VehicleFormState => ({
  registration_number: state?.registration_number ?? '',
  label: state?.label ?? '',
  fuel_type: state?.fuel_type ?? '',
  travel_mode: state?.travel_mode ?? '',
  max_volume_load_cm3: toStringValue(state?.max_volume_load_cm3),
  max_weight_load_g: toStringValue(state?.max_weight_load_g),
  max_speed_kmh: toStringValue(state?.max_speed_kmh),
  cost_per_km: toStringValue(state?.cost_per_km),
  cost_per_hour: toStringValue(state?.cost_per_hour),
  travel_distance_limit_km: toStringValue(state?.travel_distance_limit_km),
  travel_duration_limit_minutes: toStringValue(state?.travel_duration_limit_minutes),
  is_system: state?.is_system ?? false,
})

export const VehicleFormProvider = ({
  children,
  payload,
}: {
  children: ReactNode
  payload: VehicleFormPayload
}) => {
  const existing = useVehicleByClientId(payload.clientId ?? null)
  const [formState, setFormState] = useState<VehicleFormState>(() =>
    buildInitialForm(payload, existing ?? undefined),
  )
  const initialFormRef = useRef<VehicleFormState | null>(null)
  const warnings = useVehicleFormWarnings()

  useEffect(() => {
    const initial = buildInitialForm(payload, existing ?? undefined)
    setFormState(initial)
    makeInitialFormCopy(initialFormRef, initial)
  }, [existing, payload])

  const { validateForm } = useVehicleFormValidation({ formState, warnings })
  const submitters = useVehicleFormSubmit({
    payload,
    formState,
    validateForm,
    initialFormRef,
  })

  const value = useMemo(
    () => ({
      payload,
      formState,
      setFormState,
      initialFormRef,
      warnings,
      ...submitters,
    }),
    [formState, payload, submitters, warnings],
  )

  return <VehicleFormContextProvider value={value}>{children}</VehicleFormContextProvider>
}
