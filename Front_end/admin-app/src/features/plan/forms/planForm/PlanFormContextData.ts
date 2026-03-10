// hooks/usePlanFormContextData.ts
import { usePlanByServerId } from '@/features/plan/store/usePlan.selector'
import type { PopupPayload } from './PlanForm.types'

export const usePlanFormContextData = (entryPayload?: PopupPayload) => {

  const clientId = entryPayload?.clientId ?? null
  const serverId = entryPayload?.serverId ?? null
  const mode = entryPayload?.mode ?? 'create'
  const selectedOrderServerIds = entryPayload?.selectedOrderServerIds ?? []
  const source = entryPayload?.source ?? null

  const planData = usePlanByServerId(serverId)


  return {
    clientId,
    mode,
    source,
    planData,
    selectedOrderServerIds,
    isEdit: mode === 'edit',
    hasPlan: !!planData,
  }
}
