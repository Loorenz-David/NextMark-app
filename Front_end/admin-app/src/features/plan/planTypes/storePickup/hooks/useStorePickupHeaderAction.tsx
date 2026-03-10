import { PlusIcon } from '@/assets/icons'
import { BasicButton } from '@/shared/buttons/BasicButton'
import { useOrderActions } from '@/features/order'
import { usePopupManager } from '@/shared/resource-manager/useResourceManager'

type Props = {
  planId?: number | null
}

export const useStorePickupHeaderAction = ({ planId }: Props) => {
  const { openOrderForm } = useOrderActions()
  const popupManager = usePopupManager()
  const handleCreateOrder = () => {
    openOrderForm({ mode: 'create', deliveryPlanId: planId })
  }

  const handleEditPlan = ()=>{
    popupManager.open({key:'PlanForm', payload:{serverId:planId, mode:'edit'}})
  }
  

  return {

    handleCreateOrder,
    handleEditPlan
  }
}
