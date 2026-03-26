import type { ChangeEvent, Dispatch, SetStateAction } from 'react'
import type { DeliveryPlan, PlanTypeKey } from '../../types/plan'

import type { LocalDeliveryPlanInput } from '../../planTypes/localDelivery/types/localDeliveryPlan'
import type { StorePickupPlanInput } from '../../types/storePickupPlan'
import type { InternationalShippingPlanInput } from '../../types/internationalShippingPlan'
import { usePlanFormWarnings } from './PlanForm.warnings'
import { usePlanFormActions } from './planForm.actions'
import type { usePlanFormSetters } from './planForm.setters'

export type PlanFormMode = 'create' | 'edit'

export type PopupPayload = {
    clientId?: string
    serverId?: number
    mode: PlanFormMode
    selectedOrderServerIds?: number[]
    source?: 'order_multi_select'
}

export type PlanTypeState =
  | LocalDeliveryPlanInput 
  | InternationalShippingPlanInput 
  | StorePickupPlanInput 


export type PropsPlanFormContext = {
    planForm: DeliveryPlan
    mode: PlanFormMode
    planSetters: ReturnType<typeof usePlanFormSetters>
    planActions: ReturnType<typeof usePlanFormActions>
    planFormWarnings: PlanWarningsControllers
    hasUnsavedChanges: boolean
}

export type PlanWarningsControllers = ReturnType<typeof usePlanFormWarnings>

export type PlanFormActions = ReturnType<typeof usePlanFormActions>
