import { normalizeEntityMap } from '@/lib/utils/entities/normalizeEntityMap'

import type { Vehicle, VehicleMap } from '../types/vehicle'

export const useVehicleModel = () => ({
  normalizeVehicles: (payload: VehicleMap | Vehicle | null | undefined) =>
    normalizeEntityMap<Vehicle>(payload ?? null),
})
