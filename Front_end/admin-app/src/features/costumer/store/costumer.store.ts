import { createEntityStore } from '@/shared/store/StoreFactory'

import type { Costumer } from '../dto/costumer.dto'

export const useCostumerStore = createEntityStore<Costumer>()

export const clearCostumers = () => useCostumerStore.getState().clear()
