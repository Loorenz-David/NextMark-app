import { normalizeEntityMap } from '@/lib/utils/entities/normalizeEntityMap'

import type { Warehouse, WarehouseMap } from '../types/warehouse'

export const useWarehouseModel = () => ({
  normalizeWarehouses: (payload: WarehouseMap | Warehouse | null | undefined) =>
    normalizeEntityMap<Warehouse>(payload ?? null),
})
