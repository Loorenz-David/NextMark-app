import type { EntityTable } from "@shared-store"
import { createEntityStore } from "@shared-store"
import { selectAll, selectByClientId, selectByServerId } from "@shared-store"

import type { Warehouse } from '../types/warehouse'

export const useWarehouseStore = createEntityStore<Warehouse>()

export const selectAllWarehouses = (state: EntityTable<Warehouse>) =>
  selectAll<Warehouse>()(state)

export const selectWarehouseByClientId = (clientId: string | null | undefined) =>
  (state: EntityTable<Warehouse>) =>
    selectByClientId<Warehouse>(clientId)(state)

export const selectWarehouseByServerId = (id: number | null | undefined) =>
  (state: EntityTable<Warehouse>) =>
    selectByServerId<Warehouse>(id)(state)

export const insertWarehouses = (table: { byClientId: Record<string, Warehouse>; allIds: string[] }) =>
  useWarehouseStore.getState().insertMany(table)

export const upsertWarehouse = (item: Warehouse) => {
  const state = useWarehouseStore.getState()
  if (state.byClientId[item.client_id]) {
    state.update(item.client_id, (existing) => ({ ...existing, ...item }))
    return
  }
  state.insert(item)
}

export const removeWarehouse = (clientId: string) =>
  useWarehouseStore.getState().remove(clientId)
