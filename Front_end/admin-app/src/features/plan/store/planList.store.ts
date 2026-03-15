import type { ListState } from "@shared-store"
import type { PlanPagination, PlanQueryFilters, PlanStats } from '@/features/plan/types/planMeta'

import { createListStore } from "@shared-store"

export const usePlanListStore = createListStore<PlanStats, PlanQueryFilters, PlanPagination>()

export const selectPlanListStats = (state: ListState<PlanStats, PlanQueryFilters, PlanPagination>) => state.stats

export const selectPlanListPagination = (state: ListState<PlanStats, PlanQueryFilters, PlanPagination>) =>
  state.pagination

export const selectPlanListQuery = (state: ListState<PlanStats, PlanQueryFilters, PlanPagination>) => state.query

export const selectPlanListLoading = (state: ListState<PlanStats, PlanQueryFilters, PlanPagination>) => state.isLoading

export const selectPlanListError = (state: ListState<PlanStats, PlanQueryFilters, PlanPagination>) => state.error

export const setPlanListResult = (payload: {
  queryKey: string
  query?: PlanQueryFilters
  stats?: PlanStats
  pagination?: PlanPagination
}) => usePlanListStore.getState().setResult(payload)

export const setPlanListLoading = (loading: boolean) => usePlanListStore.getState().setLoading(loading)

export const setPlanListError = (error?: string) => usePlanListStore.getState().setError(error)

export const clearPlanList = () => usePlanListStore.getState().clear()

export const incrementPlanListTotal = () =>
  usePlanListStore.setState((state) => {
    if (!state.stats) {
      return state
    }

    return {
      ...state,
      stats: {
        ...state.stats,
        plans: {
          ...state.stats.plans,
          total: state.stats.plans.total + 1,
        },
      },
    }
  })


