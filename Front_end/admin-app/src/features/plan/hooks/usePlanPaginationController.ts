import { useCallback, useMemo, useRef } from 'react'

import { appendVisiblePlans, setVisiblePlans } from '../store/plan.slice'
import { buildPlanQueryKey, usePlanQueries } from '../flows/planQueries.flow'
import type { PlanQueryFilters } from '../types/planMeta'
import {
  setPlanListError,
  setPlanListLoading,
  setPlanListResult,
} from '../store/planList.store'
import {
  selectPlanCurrentPage,
  selectPlanHasMore,
  selectPlanIsLoadingPage,
  selectPlanNextCursor,
  usePlanPaginationStore,
} from '../store/planPagination.store'

type Params = {
  query?: PlanQueryFilters
  scrollToTop?: () => void
}

export const usePlanPaginationController = ({ query, scrollToTop }: Params = {}) => {
  const { fetchPlansPage } = usePlanQueries()
  const fetchPlansPageRef = useRef(fetchPlansPage)
  fetchPlansPageRef.current = fetchPlansPage
  const currentPage = usePlanPaginationStore(selectPlanCurrentPage)
  const hasMore = usePlanPaginationStore(selectPlanHasMore)
  const isLoadingPage = usePlanPaginationStore(selectPlanIsLoadingPage)
  const nextCursor = usePlanPaginationStore(selectPlanNextCursor)

  const queryKey = useMemo(() => buildPlanQueryKey(query), [query])

  const loadPage = useCallback(async (append: boolean) => {
    const paginationState = usePlanPaginationStore.getState()
    const cursor = append ? paginationState.nextCursor : null

    if (!append) {
      paginationState.reset(queryKey)
      setVisiblePlans([])
      scrollToTop?.()
    }

    const requestVersion = paginationState.startRequest()

    setPlanListLoading(true)
    const response = await fetchPlansPageRef.current({
      ...query,
      limit: 25,
      ...(append && cursor ? { after_cursor: cursor } : {}),
    })

    if (usePlanPaginationStore.getState().requestVersion !== requestVersion) {
      return null
    }

    if (!response?.delivery_plan) {
      usePlanPaginationStore.getState().setLoadingPage(false)
      setPlanListError('Missing delivery plans response.')
      return null
    }

    if (append) {
      appendVisiblePlans(response.delivery_plan.allIds)
    } else {
      setVisiblePlans(response.delivery_plan.allIds)
    }

    setPlanListResult({
      queryKey,
      query: {
        ...query,
        limit: 25,
      },
      stats: response.delivery_plan_stats,
      pagination: response.delivery_plan_pagination,
    })

    usePlanPaginationStore.getState().applyPageResult({
      queryKey,
      nextCursor: response.delivery_plan_pagination?.next_cursor ?? null,
      hasMore: response.delivery_plan_pagination?.has_more ?? false,
      append,
    })

    return response
  }, [query, queryKey, scrollToTop])

  const loadFirstPage = useCallback(async () => loadPage(false), [loadPage])
  const loadNextPage = useCallback(async () => {
    if (isLoadingPage || !hasMore || !nextCursor) return null
    return loadPage(true)
  }, [hasMore, isLoadingPage, loadPage, nextCursor])

  return {
    currentPage,
    hasMore,
    isLoadingPage,
    loadFirstPage,
    loadNextPage,
    queryKey,
  }
}
