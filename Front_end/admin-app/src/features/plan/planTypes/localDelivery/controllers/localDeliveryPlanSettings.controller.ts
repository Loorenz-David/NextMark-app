import { useCallback } from 'react'

import { ApiError } from '@/lib/api/ApiClient'
import { useMessageHandler } from '@/shared/message-handler'

import {
  localDeliveryPlanSettingsApi,
} from '@/features/plan/planTypes/localDelivery/api/localDeliveryPlanSettings.api'
import {
  saveDriverIdPreference,
  saveEtaToleranceMinutesPreference,
  saveEndLocationPreference,
  saveEndTimePreference,
  saveRouteEndStrategyPreference,
  saveStartLocationPreference,
  saveStartTimePreference,
  saveStopsServiceTimePreference,
} from '@/features/plan/planTypes/localDelivery/forms/localDeliveryEditForm/localDeliveryEditForm.storage'
import { normalizeLocalDeliveryEditFormToSettingsPayload } from '@/features/plan/planTypes/localDelivery/api/mappers/localDeliveryPlanSettings.mapper'
import { normalizeByClientIdArray } from '@/features/plan/planTypes/localDelivery/api/mappers/routeSolutionPayload.mapper'
import {
  serviceTimeMinutesToSeconds,
  serviceTimeSecondsToMinutes,
} from '@/features/plan/planTypes/localDelivery/domain/serviceTimeUnits'
import type { DeliveryPlan } from '@/features/plan/types/plan'
import type { LocalDeliveryPlan } from '@/features/plan/planTypes/localDelivery/types/localDeliveryPlan'
import type { RouteSolution } from '@/features/plan/planTypes/localDelivery/types/routeSolution'
import type { LocalDeliveryEditFormState } from '@/features/plan/planTypes/localDelivery/forms/localDeliveryEditForm/LocalDeliveryEditForm.types'

import {
  selectPlanByServerId,
  updatePlan,
  usePlanStore,
} from '@/features/plan/store/plan.slice'
import {
  selectLocalDeliveryPlanByServerId,
  updateLocalDeliveryPlan,
  useLocalDeliveryPlanStore,
} from '@/features/plan/planTypes/localDelivery/store/localDelivery.slice'
import {
  selectRouteSolutionByServerId,
  setSelectedRouteSolution,
  updateRouteSolution,
  upsertRouteSolution,
  useRouteSolutionStore,
} from '@/features/plan/planTypes/localDelivery/store/routeSolution.store'
import {
  upsertRouteSolutionStop,
} from '@/features/plan/planTypes/localDelivery/store/routeSolutionStop.store'

const resolveError = (error: unknown, fallback: string) => ({
  message: error instanceof ApiError ? error.message : fallback,
  status: error instanceof ApiError ? error.status : 500,
})

const applyResponsePayload = (
  payload?: Awaited<ReturnType<typeof localDeliveryPlanSettingsApi.updateLocalDeliverySettings>>['data'] | null,
) => {
  if (!payload) return

  const solutions = normalizeByClientIdArray(payload.route_solution)
  solutions.forEach((solution) => {
    if (solution?.client_id) {
      upsertRouteSolution(solution)
    }
  })

  const selected = solutions.find((solution) => solution.is_selected && solution.id)
  if (selected?.id) {
    setSelectedRouteSolution(selected.id, selected.local_delivery_plan_id ?? null)
  }

  const persistedSource = selected ?? solutions[0]
  if (persistedSource) {
    saveStartTimePreference(persistedSource.set_start_time ?? null)
    saveEndTimePreference(persistedSource.set_end_time ?? null)
    if (persistedSource.route_end_strategy) {
      saveRouteEndStrategyPreference(persistedSource.route_end_strategy)
    }
    saveStartLocationPreference(persistedSource.start_location ?? null)
    saveEndLocationPreference(persistedSource.end_location ?? null)
    saveDriverIdPreference(persistedSource.driver_id ?? null)
    saveEtaToleranceMinutesPreference(
      Math.max(0, Math.trunc((persistedSource.eta_tolerance_seconds ?? 0) / 60)),
    )
    saveStopsServiceTimePreference(
      serviceTimeSecondsToMinutes(persistedSource.stops_service_time ?? null),
    )
  }

  const stops = normalizeByClientIdArray(payload.route_solution_stops)
  stops.forEach((stop) => {
    if (stop?.client_id) {
      upsertRouteSolutionStop(stop)
    }
  })
}

export function useLocalDeliveryPlanSettingsMutations() {
  const { showMessage } = useMessageHandler()

  const updateLocalDeliverySettings = useCallback(
    async (formState: LocalDeliveryEditFormState) => {
      const payload = normalizeLocalDeliveryEditFormToSettingsPayload(formState)
      
      const snapshots: {
        plan: DeliveryPlan | null
        local: LocalDeliveryPlan | null
        route: RouteSolution | null
      } = {
        plan: null,
        local: null,
        route: null,
      }

      if (payload.delivery_plan?.id) {
        const plan = selectPlanByServerId(payload.delivery_plan.id)(usePlanStore.getState())
        if (plan) {
          snapshots.plan = { ...plan }
          updatePlan(plan.client_id, (prev) => ({
            ...prev,
            ...payload.delivery_plan,
          }))
        }
      }

      if (payload.local_delivery_plan_id) {
        const localPlan = selectLocalDeliveryPlanByServerId(payload.local_delivery_plan_id)(
          useLocalDeliveryPlanStore.getState(),
        )
        if (localPlan && payload.local_delivery_plan) {
          snapshots.local = { ...localPlan }
          updateLocalDeliveryPlan(localPlan.client_id, (prev) => ({
            ...prev,
            ...payload.local_delivery_plan,
          }))
        }
      }

      const routeSolutionId =
        payload.route_solution?.id ?? payload.route_solution?.route_solution_id
      if (!payload.create_variant_on_save && routeSolutionId) {
        const solution = selectRouteSolutionByServerId(routeSolutionId)(
          useRouteSolutionStore.getState(),
        )
        if (solution) {
          snapshots.route = { ...solution }
          const { eta_tolerance_minutes, ...routePatchRest } = payload.route_solution ?? {}
          const nextRoutePatch = {
            ...routePatchRest,
            eta_tolerance_seconds:
              typeof eta_tolerance_minutes === 'number'
                ? eta_tolerance_minutes * 60
                : solution.eta_tolerance_seconds,
            stops_service_time:
              payload.route_solution?.stops_service_time != null
                ? payload.route_solution.stops_service_time
                : solution.stops_service_time,
          }
          updateRouteSolution(solution.client_id, (prev) => ({
            ...prev,
            ...nextRoutePatch,
          }))
        }
      }

      try {
        const response = await localDeliveryPlanSettingsApi.updateLocalDeliverySettings(payload)

        if(response?.data){
            applyResponsePayload(response.data)
            return response.data
        }
        return {}
      } catch (error) {
        const resolved = resolveError(error, 'Unable to update local delivery settings.')
        console.error('Failed to update local delivery settings', error)

        if (snapshots.plan?.client_id) {
          updatePlan(snapshots.plan.client_id, () => snapshots.plan as DeliveryPlan)
        }
        if (snapshots.local?.client_id) {
          updateLocalDeliveryPlan(snapshots.local.client_id, () => snapshots.local as LocalDeliveryPlan)
        }
        if (snapshots.route?.client_id) {
          updateRouteSolution(snapshots.route.client_id, () => snapshots.route as RouteSolution)
        }

        showMessage({ status: resolved.status, message: resolved.message })
        return null
      }
    },
    [showMessage],
  )

  return {
    updateLocalDeliverySettings,
  }
}
