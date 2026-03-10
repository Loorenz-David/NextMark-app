import type { RefObject } from 'react'

import { hasFormChanges } from '@/shared/data-validation/compareChanges'
import { isDateOnOrAfterToday } from '@/shared/data-validation/timeValidation'

import type { DeliveryPlan } from '../../types/plan'
import type { PlanWarningsControllers, PlanTypeState } from './PlanForm.types'

type Props = {
    planFormWarnings: PlanWarningsControllers
    planForm: DeliveryPlan
    initialPlanFormRef: RefObject<DeliveryPlan | null>
}

export const usePlanFormValidation = ({
    planFormWarnings,
    planForm,
    initialPlanFormRef,
}:Props)=>{

    const planValidateForm = ()=>{
        const v = planFormWarnings

        const valid =[
            v.planNameWarning.validate(planForm.label),
            v.planStartDateWarning.validate({start_date: planForm.start_date, end_date: planForm.end_date }),
            isDateOnOrAfterToday(planForm.start_date),
            isDateOnOrAfterToday(planForm.end_date),
        ]
        
        return valid.every( v => v === true)
    }

    const setCloseGuards = () =>{
        const val =  (
            !hasFormChanges( planForm, initialPlanFormRef) 
        )
       
        return val
    }


    return {
        planValidateForm,
        hasChanges: setCloseGuards
    }
}
