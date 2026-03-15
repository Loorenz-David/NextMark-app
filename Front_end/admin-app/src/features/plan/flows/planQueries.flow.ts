import { useCallback } from 'react'

import { normalizeEntityMap } from '@/lib/utils/entities/normalizeEntityMap'
import { ApiError } from '@/lib/api/ApiClient'
import { useMessageHandler } from '@shared-message-handler'

import { planApi } from '@/features/plan/api/plan.api'
import { planTypesApi } from '@/features/plan/api/planTypes.api'
import type { DeliveryPlan, DeliveryPlanMap, PlanTypeKey } from '@/features/plan/types/plan'
import type { PlanQueryFilters } from '@/features/plan/types/planMeta'
import { insertPlans, selectPlanByServerId, upsertPlan, usePlanStore } from '@/features/plan/store/plan.slice'
import {
  setPlanListError,
} from '@/features/plan/store/planList.store'
import { upsertInternationalShippingPlans } from '@/features/plan/planTypes/internationalShipping/store/internationalShipping.slice'
import { upsertLocalDeliveryPlans } from '@/features/plan/planTypes/localDelivery/store/localDelivery.slice'
import { upsertStorePickupPlans } from '@/features/plan/planTypes/storePickup/store/storePickup.slice'

export const buildPlanQueryKey = (query?: PlanQueryFilters) => JSON.stringify(query ?? {})



const upsertPlanTypePayload = (
  planType: PlanTypeKey,
  payload: unknown,
) => {
  const map = normalizeEntityMap(payload as Record<string, { client_id: string }>)
  if (!map) {
    return
  }

  switch (planType) {
    case 'local_delivery':
      upsertLocalDeliveryPlans(map)
      break
    case 'international_shipping':
      upsertInternationalShippingPlans(map)
      break
    case 'store_pickup':
      upsertStorePickupPlans(map)
      break
    default:
      break
  }
}

export function usePlanQueries() {
  const { showMessage } = useMessageHandler()

  const fetchPlansPage = useCallback(
    async (query?: PlanQueryFilters) => {
      try {
        const response = await planApi.listPlans(query)

        const payload = response.data

        if (!payload?.delivery_plan) {
          console.warn('Plan list response missing delivery_plan', payload)
          setPlanListError('Missing delivery plans response.')
          return null
        }

        insertPlans(payload.delivery_plan)
        return payload
      } catch (error) {
        const message = error instanceof ApiError ? error.message : 'Unable to load delivery plans.'
        const status = error instanceof ApiError ? error.status : 500
        console.error('Failed to fetch delivery plans', error)
        setPlanListError(message)
        showMessage({ status, message })
        return null
      }
    },
    [showMessage],
  )

  const fetchPlanById = useCallback(
    async (planId: number | string) => {
      try {
        const response = await planApi.getPlan(planId)
        const payload = response.data

        const normalized = normalizeEntityMap<DeliveryPlan>(payload?.delivery_plan as DeliveryPlanMap | DeliveryPlan)
        if (!normalized) {
          console.warn('Plan response missing delivery_plan', payload)
          return null
        }

        if (normalized.allIds.length === 1) {
          upsertPlan(normalized.byClientId[normalized.allIds[0]])
        } else {
          insertPlans(normalized)
        }

        return normalized
      } catch (error) {
        const message = error instanceof ApiError ? error.message : 'Unable to load delivery plan.'
        const status = error instanceof ApiError ? error.status : 500
        console.error('Failed to fetch delivery plan', error)
        showMessage({ status, message })
        return null
      }
    },
    [showMessage],
  )

  const fetchPlanTypeForPlan = useCallback(
    async (planId: number) => {
      const plan = selectPlanByServerId(planId)(usePlanStore.getState())
      if (!plan) {
        showMessage({ status: 404, message: 'Plan not found for type lookup.' })
        return null
      }

      try {
        const response = await planTypesApi.getPlanType(planId, plan.plan_type)
        const payload = response.data
        if (!payload?.delivery_plan_type) {
          console.warn('Plan type response missing delivery_plan_type', payload)
          return null
        }

        upsertPlanTypePayload(plan.plan_type, payload.delivery_plan_type)
        return payload.delivery_plan_type
      } catch (error) {
        const message = error instanceof ApiError ? error.message : 'Unable to load plan type.'
        const status = error instanceof ApiError ? error.status : 500
        console.error('Failed to fetch plan type', error)
        showMessage({ status, message })
        return null
      }
    },
    [showMessage],
  )

  return {
    fetchPlansPage,
    fetchPlanById,
    fetchPlanTypeForPlan,
  }
}
