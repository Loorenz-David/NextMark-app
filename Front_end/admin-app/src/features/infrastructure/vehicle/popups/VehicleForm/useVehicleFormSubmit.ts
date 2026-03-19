import { useCallback } from 'react'

import { useMessageHandler } from '@shared-message-handler'
import { getObjectDiff } from '@shared-utils'
import { hasFormChanges } from '@shared-domain'
import { buildClientId } from '@/lib/utils/clientId'

import { useCreateVehicle, useUpdateVehicle } from '../../api/vehicleApi'
import type { VehicleUpdatePayload } from '../../api/vehicleApi'
import { useVehicleByClientId } from '../../hooks/useVehicleSelectors'
import { useVehiclePopupController } from '../../hooks/useVehiclePopupController'
import { upsertVehicle } from '../../store/vehicleStore'
import type { VehicleInput } from '../../types/vehicle'

import type { VehicleFormPayload, VehicleFormState } from './VehicleForm.types'

const toNumberOrNull = (value: string | undefined) => {
  if (!value) return null
  const numeric = Number(value)
  return Number.isNaN(numeric) ? null : numeric
}

const toOptionalString = (value: string | undefined) => (value?.trim() ? value.trim() : null)

export const useVehicleFormSubmit = ({
  payload,
  formState,
  validateForm,
  initialFormRef,
}: {
  payload: VehicleFormPayload
  formState: VehicleFormState
  validateForm: () => boolean
  initialFormRef: React.RefObject<VehicleFormState | null>
}) => {
  const { showMessage } = useMessageHandler()
  const createVehicle = useCreateVehicle()
  const updateVehicle = useUpdateVehicle()
  const existing = useVehicleByClientId(payload.clientId ?? null)
  const { closeVehicleForm } = useVehiclePopupController()

  const handleSave = useCallback(async () => {
    if (!validateForm()) {
      showMessage({ status: 400, message: 'Please fix the highlighted fields.' })
      return
    }

    if (!hasFormChanges(formState, initialFormRef)) {
      showMessage({ status: 400, message: 'No changes to save.' })
      return
    }

    const initialForm = initialFormRef.current
    if (!initialForm) {
      showMessage({ status: 400, message: 'Missing initial form snapshot.' })
      return
    }

    const diff = getObjectDiff(initialForm, formState)
    const basePayload: VehicleInput = {
      client_id: existing?.client_id ?? buildClientId('vehicle'),
      registration_number: diff.registration_number ?? formState.registration_number,
      label: toOptionalString(diff.label ?? formState.label),
      fuel_type: toOptionalString(diff.fuel_type ?? formState.fuel_type) as VehicleInput['fuel_type'],
      travel_mode: toOptionalString(diff.travel_mode ?? formState.travel_mode) as VehicleInput['travel_mode'],
      max_volume_load_cm3: toNumberOrNull(diff.max_volume_load_cm3 ?? formState.max_volume_load_cm3),
      max_weight_load_g: toNumberOrNull(diff.max_weight_load_g ?? formState.max_weight_load_g),
      max_speed_kmh: toNumberOrNull(diff.max_speed_kmh ?? formState.max_speed_kmh),
      cost_per_km: toNumberOrNull(diff.cost_per_km ?? formState.cost_per_km),
      cost_per_hour: toNumberOrNull(diff.cost_per_hour ?? formState.cost_per_hour),
      travel_distance_limit_km: toNumberOrNull(diff.travel_distance_limit_km ?? formState.travel_distance_limit_km),
      travel_duration_limit_minutes: toNumberOrNull(diff.travel_duration_limit_minutes ?? formState.travel_duration_limit_minutes),
      is_system: diff.is_system ?? formState.is_system,
    }

    try {
      if (payload.mode === 'create') {
        await createVehicle(basePayload)
        upsertVehicle({ ...basePayload })
      } else if (existing?.id) {
        const updatePayload: VehicleUpdatePayload = {
          target_id: existing.id,
          fields: basePayload,
        }
        await updateVehicle(updatePayload)
        upsertVehicle({ ...existing, ...basePayload })
      }
      closeVehicleForm()
    } catch (error) {
      console.error('Failed to save vehicle', error)
      showMessage({ status: 500, message: 'Unable to save vehicle.' })
    }
  }, [
    closeVehicleForm,
    createVehicle,
    existing,
    formState,
    initialFormRef,
    payload.mode,
    showMessage,
    updateVehicle,
    validateForm,
  ])

  return { handleSave }
}
