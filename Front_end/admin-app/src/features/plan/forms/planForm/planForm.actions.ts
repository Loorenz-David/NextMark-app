import { useCallback } from 'react'
import { useMessageHandler } from '@/shared/message-handler/MessageHandlerContext'
import type { DeliveryPlan } from '../../types/plan'
import { usePlanController } from '../../controllers/plan.controller'
import { useBaseControlls } from '@/shared/resource-manager/useResourceManager'
import { useOrderSelectionStore } from '@/features/order/store/orderSelection.store'


type Props = {
    planForm: DeliveryPlan
    planValidateForm: ()=>boolean
    selectedOrderServerIds?: number[]
    source?: 'order_multi_select' | null
}

export const usePlanFormActions = ({
    planForm,
    planValidateForm,
    selectedOrderServerIds = [],
    source,
}: Props) => {
    const { showMessage } = useMessageHandler()
    const { createPlan, deletePlan } = usePlanController()
    const baseControlls = useBaseControlls()


    const handleCreatePlan = useCallback(async (): Promise<boolean> => {

        const isValidPlanForm  = planValidateForm()


        if (!isValidPlanForm) {
            showMessage({message:'Invalid form, check for required fields.', status:'warning'})
            return false
        }

        const response = await createPlan(planForm, {
            newOrderLinks: selectedOrderServerIds,
        })

        if (response !== null) {
            if (source === 'order_multi_select') {
                useOrderSelectionStore.getState().disableSelectionMode()
            }
            return true
        }
        return false
    }, [createPlan, planForm, planValidateForm, selectedOrderServerIds, showMessage, source])

    const handleDeletePlan = useCallback(async (): Promise<boolean> => {
        const planId = planForm.id ?? planForm.client_id
        if (!planId) {
            showMessage({message:"Plan id is missing.", status:'warning'})
            return false
        }

        const result = await deletePlan(planId)
        if (result) {
            baseControlls.closeBase()
            return true
        }
        return false
    }, [baseControlls, deletePlan, planForm, showMessage])

    return {
        handleCreatePlan,
        handleDeletePlan
    }
}
