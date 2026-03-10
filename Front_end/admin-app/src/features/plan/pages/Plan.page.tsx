
import { useCallback, useEffect, useRef } from "react";



import { useVisiblePlans } from "../store/usePlan.selector";

import { PlanList, PlanMainHeader } from "../components";
import { usePlanHeaderAction } from "../actions/usePlanActions";
import { usePlanListStats } from "../store/planList.selector";
import { BasicButton } from "@/shared/buttons/BasicButton";
import { usePlanPaginationController } from "../hooks/usePlanPaginationController";


type PlanListPage = {
  onRequestClose?: () => void
  showCloseButton?: boolean
}

export const PlanPage = ({
    onRequestClose,
    showCloseButton
}:PlanListPage) => {
    const scrollContainerRef = useRef<HTMLDivElement | null>(null)
    const handleScrollToTop = useCallback(() => {
      if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollTop = 0
      }
    }, [])
    const plans = useVisiblePlans()
    const plansStats = usePlanListStats()
    const planActions = usePlanHeaderAction()
    const {
      currentPage,
      hasMore,
      isLoadingPage,
      loadFirstPage,
      loadNextPage,
    } = usePlanPaginationController({
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
            applyFilters={() => {}}
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
                    {isLoadingPage ? 'Loading…' : hasMore ? `Next Page (${currentPage + 1})` : 'No more plans'}
                  </BasicButton>
                </div>
            </div>
        </div>
     );
}


 
