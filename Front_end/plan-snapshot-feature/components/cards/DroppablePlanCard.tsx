import { useDroppable } from '@dnd-kit/core'

import { useResourceManager } from '@/shared/resource-manager/useResourceManager'

import { PlanCard } from './PlanCard'
import type { DeliveryPlan } from '../../types/plan'

type PropsPlanCard = {
    plan: DeliveryPlan;
}
export const DroppablePlanCard = ({ plan }: PropsPlanCard) => {
     const { setNodeRef, isOver } = useDroppable({
        id: `plan-${plan.client_id}`,
        data:{
            label:plan.label,
            type:'plan',
            id:plan.client_id
        }

    })
    const { planDropFeedback } = useResourceManager()
    const planFeedback = planDropFeedback && planDropFeedback.planClientId === plan.client_id
      ? planDropFeedback
      : null

    return(
        <div
            ref={setNodeRef}
        >
            <PlanCard plan={plan} isOver={isOver} dropFeedback={planFeedback} />
        </div>
    )
}
