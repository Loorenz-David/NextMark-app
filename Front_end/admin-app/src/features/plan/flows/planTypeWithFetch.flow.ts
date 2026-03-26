import { useEffect } from 'react'
import { useRoutePlanType, useRoutePlanByClientId } from '../store/useRoutePlan.selector'
import { usePlanQueries } from './planQueries.flow'

export const usePlanTypeWithFetch = (clientId: string | null | undefined) => {
  const plan = useRoutePlanByClientId(clientId)
  const planType = useRoutePlanType(clientId)
  const { fetchPlanTypeForPlan } = usePlanQueries()

  useEffect(() => {
    if (!plan) return
    if (!plan.id) return 
    if (planType) return
    fetchPlanTypeForPlan(plan.id)
  }, [plan, planType, fetchPlanTypeForPlan])

  return planType
}
