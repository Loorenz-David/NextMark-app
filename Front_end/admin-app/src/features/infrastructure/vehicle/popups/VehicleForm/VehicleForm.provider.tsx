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
    name?: string
    icon?: string | null
    travel_mode?: string | null
    cost_per_hour?: number | null
    cost_per_kilometer?: number | null
    travel_duration_limit?: number | null
    route_distance_limit?: number | null
    user_id?: number | null
    max_load?: number | null
    min_load?: number | null
    is_system?: boolean
  },
): VehicleFormState => ({
  name: state?.name ?? '',
  icon: state?.icon ?? '',
  travel_mode: state?.travel_mode ?? '',
  cost_per_hour: toStringValue(state?.cost_per_hour),
  cost_per_kilometer: toStringValue(state?.cost_per_kilometer),
  travel_duration_limit: toStringValue(state?.travel_duration_limit),
  route_distance_limit: toStringValue(state?.route_distance_limit),
  user_id: toStringValue(state?.user_id),
  max_load: toStringValue(state?.max_load),
  min_load: toStringValue(state?.min_load),
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
