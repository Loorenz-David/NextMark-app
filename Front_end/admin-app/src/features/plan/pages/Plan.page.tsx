
import { useCallback, useEffect, useRef, useState } from "react";



import { useVisiblePlans } from "../store/usePlan.selector";

import { PlanList, PlanMainHeader } from "../components";
import { usePlanHeaderAction } from "../actions/usePlanActions";
import { usePlanListStats } from "../store/planList.selector";
import { BasicButton } from "@/shared/buttons/BasicButton";
import { usePlanPaginationController } from "../hooks/usePlanPaginationController";
import type { PlanDateFilterPayload } from "../components/planDateFilter";
import type { PlanQueryFilters } from "../types/planMeta";


type PlanListPage = {
  onRequestClose?: () => void
  showCloseButton?: boolean
}

const mergePlanQuery = (previous: PlanQueryFilters | undefined, next: PlanQueryFilters): PlanQueryFilters => {
  const merged: PlanQueryFilters = {
    ...previous,
    ...next,
  }

  merged.filters = {
    ...(typeof previous?.filters === 'object' && previous.filters && !Array.isArray(previous.filters)
      ? previous.filters
      : {}),
    ...(typeof next.filters === 'object' && next.filters && !Array.isArray(next.filters)
      ? next.filters
      : {}),
  }

  return merged
}

const queryEquals = (left: PlanQueryFilters | undefined, right: PlanQueryFilters | undefined): boolean => {
  return JSON.stringify(left ?? {}) === JSON.stringify(right ?? {})
}

export const PlanPage = ({
    onRequestClose,
    showCloseButton
}:PlanListPage) => {
    const [activeQuery, setActiveQuery] = useState<PlanQueryFilters | undefined>(undefined)
    const scrollContainerRef = useRef<HTMLDivElement | null>(null)
    const handleScrollToTop = useCallback(() => {
      if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollTop = 0
      }
    }, [])
    const plans = useVisiblePlans()
    const plansStats = usePlanListStats()
    const planActions = usePlanHeaderAction()
    const handleFilterSelection = useCallback((payload: PlanDateFilterPayload) => {
      const nextFilters = {
        mode: payload.selection.mode,
        ...payload.filters,
      }

      setActiveQuery((previous) => {
        const candidate = mergePlanQuery(previous, nextFilters)
        return queryEquals(previous, candidate) ? previous : candidate
      })
    }, [])

    const handleFiltersChange = useCallback((filters: PlanQueryFilters) => {
      setActiveQuery((previous) => {
        const candidate = mergePlanQuery(previous, filters)
        return queryEquals(previous, candidate) ? previous : candidate
      })
    }, [])

    const {
      currentPage,
      hasMore,
      isLoadingPage,
      loadFirstPage,
      loadNextPage,
    } = usePlanPaginationController({
      query: activeQuery,
      scrollToTop: handleScrollToTop,
    })
    useEffect(()=>{
        void loadFirstPage()
    }, [loadFirstPage])


    return ( 
        <div className="flex flex-col w-full h-full">
            <PlanMainHeader
            onCreate={planActions.onCreatePlan}
            onRequestClose={onRequestClose}
            showCloseButton={showCloseButton}
            planStats={plansStats}
            applySearch={() => {}}
            applyFilters={handleFiltersChange}
            applyFilterSelection={handleFilterSelection}
        />
            <div ref={scrollContainerRef} className="w-full h-full flex flex-col overflow-y-auto scroll-thin">
                <PlanList plans={plans} droppable={true}/>
                <div className="flex justify-center px-5 pb-8 pt-2">
                  <BasicButton
                    params={{
                      onClick: () => { void loadNextPage() },
                      disabled: isLoadingPage || !hasMore,
                      variant: 'secondary',
                      ariaLabel: 'Load next page of plans',
                    }}
                  >
                    {isLoadingPage ? 'Loading…' : hasMore ? 'Show more' : 'No more plans'}
                  </BasicButton>
                </div>
            </div>
        </div>
     );
}


 
