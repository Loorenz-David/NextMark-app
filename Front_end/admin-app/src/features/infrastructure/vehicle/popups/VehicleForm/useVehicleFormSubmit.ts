import { useCallback } from 'react'

import { useMessageHandler } from '@/shared/message-handler'
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
      name: diff.name ?? formState.name,
      icon: toOptionalString(diff.icon ?? formState.icon),
      travel_mode: toOptionalString(diff.travel_mode ?? formState.travel_mode),
      cost_per_hour: toNumberOrNull(diff.cost_per_hour ?? formState.cost_per_hour),
      cost_per_kilometer: toNumberOrNull(diff.cost_per_kilometer ?? formState.cost_per_kilometer),
      travel_duration_limit: toNumberOrNull(diff.travel_duration_limit ?? formState.travel_duration_limit),
      route_distance_limit: toNumberOrNull(diff.route_distance_limit ?? formState.route_distance_limit),
      user_id: toNumberOrNull(diff.user_id ?? formState.user_id),
      max_load: toNumberOrNull(diff.max_load ?? formState.max_load),
      min_load: toNumberOrNull(diff.min_load ?? formState.min_load),
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
