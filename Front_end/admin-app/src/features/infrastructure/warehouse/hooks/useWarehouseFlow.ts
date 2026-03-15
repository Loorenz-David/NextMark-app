import { useCallback, useEffect } from 'react'

import { useMessageHandler } from '@shared-message-handler'

import { useGetWarehouses } from '../api/warehouseApi'
import { useWarehouseModel } from '../domain/useWarehouseModel'
import { insertWarehouses } from '../store/warehouseStore'

export const useWarehouseFlow = () => {
  const getWarehouses = useGetWarehouses()
  const { normalizeWarehouses } = useWarehouseModel()
  const { showMessage } = useMessageHandler()

  const loadWarehouses = useCallback(async () => {
    try {
      const response = await getWarehouses()
      const payload = response.data
      if (!payload?.warehouses) {
        showMessage({ status: 500, message: 'Missing warehouses response.' })
        return null
      }
      const normalized = normalizeWarehouses(payload.warehouses)
      if (normalized) {
        insertWarehouses(normalized)
      }
      return payload
    } catch (error) {
      console.error('Failed to load warehouses', error)
      showMessage({ status: 500, message: 'Unable to load warehouses.' })
      return null
    }
  }, [getWarehouses, normalizeWarehouses, showMessage])

  useEffect(() => {
    void loadWarehouses()
  }, [loadWarehouses])

  return { loadWarehouses }
}
