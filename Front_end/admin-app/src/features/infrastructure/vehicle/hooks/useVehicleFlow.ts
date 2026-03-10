import { useCallback, useEffect } from 'react'

import { useMessageHandler } from '@/shared/message-handler'

import { useGetVehicles } from '../api/vehicleApi'
import { useVehicleModel } from '../domain/useVehicleModel'
import { insertVehicles } from '../store/vehicleStore'

export const useVehicleFlow = () => {
  const getVehicles = useGetVehicles()
  const { normalizeVehicles } = useVehicleModel()
  const { showMessage } = useMessageHandler()

  const loadVehicles = useCallback(async () => {
    try {
      const response = await getVehicles()
      const payload = response.data
      if (!payload?.vehicle) {
        showMessage({ status: 500, message: 'Missing vehicles response.' })
        return null
      }
      const normalized = normalizeVehicles(payload.vehicle)
      if (normalized) {
        insertVehicles(normalized)
      }
      return payload
    } catch (error) {
      console.error('Failed to load vehicles', error)
      showMessage({ status: 500, message: 'Unable to load vehicles.' })
      return null
    }
  }, [getVehicles, normalizeVehicles, showMessage])

  useEffect(() => {
    void loadVehicles()
  }, [loadVehicles])

  return { loadVehicles }
}
