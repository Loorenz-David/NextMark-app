import { useShallow } from 'zustand/react/shallow'

import {
  selectAllWarehouses,
  selectWarehouseByClientId,
  selectWarehouseByServerId,
  useWarehouseStore,
} from '../store/warehouseStore'

export const useWarehouses = () => useWarehouseStore(useShallow(selectAllWarehouses))

export const useWarehouseByClientId = (clientId: string | null | undefined) =>
  useWarehouseStore(selectWarehouseByClientId(clientId))

export const useWarehouseByServerId = (id: number | null | undefined) =>
  useWarehouseStore(selectWarehouseByServerId(id))
