import { useEffect } from 'react'
import { usePlanType, usePlanByClientId } from '../store/usePlan.selector'
import { usePlanQueries } from './planQueries.flow'

export const usePlanTypeWithFetch = (clientId: string | null | undefined) => {
  const plan = usePlanByClientId(clientId)
  const planType = usePlanType(clientId)
  const { fetchPlanTypeForPlan } = usePlanQueries()

  useEffect(() => {
    if (!plan) return
    if (!plan.id) return 
    if (planType) return
    fetchPlanTypeForPlan(plan.id)
  }, [plan, planType, fetchPlanTypeForPlan])

  return planType
}
