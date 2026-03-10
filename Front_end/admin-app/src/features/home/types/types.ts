import type { PlanTypeKey } from '@/features/plan/types/plan'

export type PayloadBase ={
    ordersPlanType: PlanTypeKey | null
    planId?: number | null

}