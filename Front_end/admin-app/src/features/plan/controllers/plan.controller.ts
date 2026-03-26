import { useCallback } from 'react'

import { buildClientId } from '@/lib/utils/clientId'
import { ApiError } from '@/lib/api/ApiClient'
import { useMessageHandler } from '@shared-message-handler'
import { useAddressCurrentLocationFlow } from '@/shared/inputs/address-autocomplete/hooks/useAddressCurrentLocationFlow'
import { planApi } from '@/features/plan/api/plan.api'
import { useOrderFlow, useOrderPlanPatchController } from '@/features/order'
import { resolvePlanTypeDefaults } from '@/features/plan/domain/planTypeDefaults/planTypeDefaults.registry'
import { reactivePlanVisibility } from '@/features/plan/domain/planReactiveVisibility'
import { getQueryFilters, getQuerySearch } from '@/features/order/store/orderQuery.store'
import type {
  DeliveryPlan,
  DeliveryPlanFields,
  PlanCreatePayload,
  PlanTypeKey,
} from '@/features/plan/types/plan'
import type { InternationalShippingPlan } from '@/features/plan/types/internationalShippingPlan'
import type { LocalDeliveryPlan } from '@/features/plan/planTypes/localDelivery/types/localDeliveryPlan'
import type { StorePickupPlan } from '@/features/plan/types/storePickupPlan'
import {
  addVisibleRoutePlan,
  appendVisibleRoutePlans,
  insertRoutePlan,
  removeRoutePlan,
  selectRoutePlanByClientId,
  selectRoutePlanByServerId,
  updateRoutePlan,
  useRoutePlanStore,
} from '@/features/plan/store/routePlan.slice'
import {
  insertInternationalShippingPlan,
  removeInternationalShippingPlan,
  selectInternationalShippingPlanByPlanId,
  upsertInternationalShippingPlan,
  useInternationalShippingPlanStore,
} from '@/features/plan/planTypes/internationalShipping/store/internationalShipping.slice'
import {
  insertLocalDeliveryPlan,
  removeLocalDeliveryPlan,
  selectLocalDeliveryPlanByPlanId,
  upsertLocalDeliveryPlan,
  useLocalDeliveryPlanStore,
} from '@/features/plan/planTypes/localDelivery/store/localDelivery.slice'
import {
  insertStorePickupPlan,
  removeStorePickupPlan,
  selectStorePickupPlanByPlanId,
  upsertStorePickupPlan,
  useStorePickupPlanStore,
} from '@/features/plan/planTypes/storePickup/store/storePickup.slice'
import { upsertRouteSolution } from '@/features/plan/planTypes/localDelivery/store/routeSolution.store'
import { incrementRoutePlanListTotal, useRoutePlanListStore } from '@/features/plan/store/routePlanList.store'

type PlanTypeFields = LocalDeliveryPlan | InternationalShippingPlan | StorePickupPlan




const insertPlanType = (planType: PlanTypeKey, planTypeFields: PlanTypeFields) => {
  switch (planType) {
    case 'local_delivery':
      insertLocalDeliveryPlan(planTypeFields as LocalDeliveryPlan)
      break
    case 'international_shipping':
      insertInternationalShippingPlan(planTypeFields as InternationalShippingPlan)
      break
    case 'store_pickup':
      insertStorePickupPlan(planTypeFields as StorePickupPlan)
      break
    default:
      break
  }
}

const upsertPlanType = (
  planType: PlanTypeKey,
  payload: PlanTypeFields,
) => {
  switch (planType) {
    case 'local_delivery':
      upsertLocalDeliveryPlan(payload as LocalDeliveryPlan)
      break
    case 'international_shipping':
      upsertInternationalShippingPlan(payload as InternationalShippingPlan)
      break
    case 'store_pickup':
      upsertStorePickupPlan(payload as StorePickupPlan)
      break
    default:
      break
  }
}

const removePlanType = (planType: PlanTypeKey, clientId: string) => {
  switch (planType) {
    case 'local_delivery':
      removeLocalDeliveryPlan(clientId)
      break
    case 'international_shipping':
      removeInternationalShippingPlan(clientId)
      break
    case 'store_pickup':
      removeStorePickupPlan(clientId)
      break
    default:
      break
  }
}

const findPlanTypeByPlanId = (planType: PlanTypeKey, planId: number) => {
  switch (planType) {
    case 'local_delivery':
      return selectLocalDeliveryPlanByPlanId(planId)(useLocalDeliveryPlanStore.getState())
    case 'international_shipping':
      return selectInternationalShippingPlanByPlanId(planId)(useInternationalShippingPlanStore.getState())
    case 'store_pickup':
      return selectStorePickupPlanByPlanId(planId)(useStorePickupPlanStore.getState())
    default:
      return null
  }
}

const resolveError = (error: unknown, fallback: string) => ({
  message: error instanceof ApiError ? error.message : fallback,
  status: error instanceof ApiError ? error.status : 500,
})

const canInsertCreatedPlanIntoCurrentList = (plan: DeliveryPlan) => {
  const { visibleIds } = useRoutePlanStore.getState()
  const { query } = useRoutePlanListStore.getState()

  if (!visibleIds) {
    return false
  }

  if (!query) {
    return true
  }

  return reactivePlanVisibility(plan, query)
}

const syncCreatedPlanIntoVisibleList = (plan: DeliveryPlan) => {
  if (!canInsertCreatedPlanIntoCurrentList(plan)) {
    return
  }

  const currentQuery = useRoutePlanListStore.getState().query

  if (currentQuery?.sort === 'date_asc') {
    appendVisibleRoutePlans([plan.client_id])
  } else {
    addVisibleRoutePlan(plan.client_id)
  }

  incrementRoutePlanListTotal()
}

export function usePlanController() {
  const { showMessage } = useMessageHandler()
  const {
    patchOrdersPlanByServerIds,
    clearOrdersPlanByPlanId,
    restoreOrdersPlanLinks,
  } = useOrderPlanPatchController()
  const { loadOrders } = useOrderFlow()
  const { getCurrentLocationAddress } = useAddressCurrentLocationFlow()


  const createPlan = useCallback(
    async (payload: DeliveryPlanFields, options?: { newOrderLinks?: number[] }) => {
    
      const planTypeKey = payload.plan_type
      const sanitizedNewOrderLinks = Array.isArray(options?.newOrderLinks)
        ? options.newOrderLinks.filter((id) => Number.isFinite(id))
        : []

      const planClientId = payload.client_id || buildClientId('delivery_plan')
      const planTypeClientId =  buildClientId( planTypeKey )

      const normalizedPlanFields: DeliveryPlan = {
        ...payload,
        client_id: planClientId,
      }

      insertRoutePlan(normalizedPlanFields)

      insertPlanType(planTypeKey, {
        client_id: planTypeClientId,
      })

      try {
        const normalizedStartDate = normalizedPlanFields.start_date
        if (!normalizedStartDate) {
          throw new Error('start_date is required to create a plan.')
        }
        const planTypeDefaults = await resolvePlanTypeDefaults(
          planTypeKey,
          {
            getCurrentLocationAddress,
            planStartDate: normalizedStartDate,
          },
        )

        const planPayloadApi: PlanCreatePayload = {
          client_id: planClientId,
          label: normalizedPlanFields.label,
          plan_type: normalizedPlanFields.plan_type,
          start_date: normalizedStartDate,
          ...(typeof normalizedPlanFields.end_date !== 'undefined'
            ? { end_date: normalizedPlanFields.end_date }
            : {}),
          ...(sanitizedNewOrderLinks.length > 0
            ? { order_ids: sanitizedNewOrderLinks }
            : {}),
          ...(typeof planTypeDefaults !== 'undefined'
            ? { plan_type_defaults: planTypeDefaults }
            : {}),
        }

        const response = await planApi.createPlan( planPayloadApi )
        const created = response.data?.created?.[0]

        if (!created?.delivery_plan || !created?.delivery_plan_type) {
          throw new Error('Plan create response is missing created entities.')
        }

        const createdPlan = created.delivery_plan
        const createdPlanType = created.delivery_plan_type
        const createdPlanId = createdPlan.id

        if (createdPlan.client_id === planClientId) {
          updateRoutePlan(planClientId, (plan: DeliveryPlan) => ({
            ...plan,
            ...createdPlan,
          }))
        } else {
          removeRoutePlan(planClientId)
          insertRoutePlan(createdPlan)
        }

        syncCreatedPlanIntoVisibleList(createdPlan)

        if (typeof createdPlanId === 'number') {
          if (sanitizedNewOrderLinks.length > 0) {
            patchOrdersPlanByServerIds({
              orderServerIds: sanitizedNewOrderLinks,
              planId: createdPlanId,
              planType: createdPlan.plan_type,
            })
          }
        }

        removePlanType(planTypeKey, planTypeClientId)
        upsertPlanType(createdPlan.plan_type, createdPlanType as PlanTypeFields)

        if (created.route_solution) {
          upsertRouteSolution(created.route_solution)
        }

        return response.data

      } catch (error) {
        const resolved = resolveError(error, 'Unable to create delivery plan.')
        console.error('Failed to create plan', error)
        removeRoutePlan(planClientId)
        removePlanType(planTypeKey, planTypeClientId)
        showMessage({ status: resolved.status, message: resolved.message })
        return null
      }
    },
    [getCurrentLocationAddress, patchOrdersPlanByServerIds, showMessage],
  )

  const deletePlanInstance = useCallback(
    async (idOrClientId: number | string) => {
      const plan = typeof idOrClientId === 'number'
        ? selectRoutePlanByServerId(idOrClientId)(useRoutePlanStore.getState())
        : selectRoutePlanByClientId(idOrClientId)(useRoutePlanStore.getState())

      if (!plan) {
        showMessage({ status: 404, message: 'Plan not found for deletion.' })
        return null
      }

      if (!plan.id) {
        showMessage({ status: 400, message: 'Plan must be synced before deletion.' })
        return null
      }

      const planTypeInstance = findPlanTypeByPlanId(plan.plan_type, plan.id)
      const previousPlan = { ...plan }
      const previousPlanType = planTypeInstance ? { ...planTypeInstance } : null

      removeRoutePlan(plan.client_id)
      if (planTypeInstance) {
        removePlanType(plan.plan_type, planTypeInstance.client_id)
      }
      const clearedOrderLinks = clearOrdersPlanByPlanId(plan.id)

      try {
        await planApi.deletePlan({ target_id: plan.id })
        void loadOrders({
          q: getQuerySearch(),
          filters: getQueryFilters(),
        }, false)
        return true
      } catch (error) {
        const resolved = resolveError(error, 'Unable to delete delivery plan.')
        console.error('Failed to delete plan', error)
        insertRoutePlan(previousPlan)
        if (previousPlanType) {
          insertPlanType(plan.plan_type, previousPlanType)
        }
        restoreOrdersPlanLinks(clearedOrderLinks.previousByClientId)
        showMessage({ status: resolved.status, message: resolved.message })
        return null
      }
    },
    [clearOrdersPlanByPlanId, loadOrders, restoreOrdersPlanLinks, showMessage],
  )



  return {
    createPlan,
    deletePlan: deletePlanInstance,

  }
}
