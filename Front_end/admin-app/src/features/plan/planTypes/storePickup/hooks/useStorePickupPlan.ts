import {
  selectAllStorePickupPlans,
  selectStorePickupPlanByClientId,
  selectStorePickupPlanByPlanId,
  selectStorePickupPlanByServerId,
  useStorePickupPlanStore,
} from '@/features/plan/planTypes/storePickup/store/storePickup.slice'

export const useStorePickupPlans = () =>
  useStorePickupPlanStore(selectAllStorePickupPlans)

export const useStorePickupPlanByClientId = (clientId: string | null | undefined) =>
  useStorePickupPlanStore(selectStorePickupPlanByClientId(clientId))

export const useStorePickupPlanByServerId = (id: number | null | undefined) =>
  useStorePickupPlanStore(selectStorePickupPlanByServerId(id))

export const useStorePickupPlanByPlanId = (planId: number | null | undefined) =>
  useStorePickupPlanStore(selectStorePickupPlanByPlanId(planId))
