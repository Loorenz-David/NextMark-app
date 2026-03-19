

import { useBaseControlls, usePopupManager, useSectionManager } from "@/shared/resource-manager/useResourceManager"
import type { PayloadBase } from '@/features/home/types/types'
import type { DeliveryPlan } from "../types/plan";

export const usePlanHeaderAction = () => {
    const popupManager = usePopupManager()
    const baseControlls = useBaseControlls<PayloadBase>()
    const sectionManager = useSectionManager()

    const onCreatePlan = () => {
        popupManager.open({
            key:"PlanForm",
            payload:{ mode: 'create' }
        })
    };

    const openPlanSection = (plan:DeliveryPlan)=>{
        if (!plan.id) return

        
        if( sectionManager.getOpenCount() > 0 ){
            sectionManager.closeAll()
        }
        baseControlls.openBase({
            payload: { planId: plan.id, ordersPlanType: plan.plan_type },
        })
    }

   
    return {
        onCreatePlan,
        openPlanSection
    };
}
