import { selectCaseChatsByOrderCaseId, selectOrderCaseByServerId, updateOrderCaseUnseenCount, upsertCaseChats, useCaseChatsStore, useOrderCasesStore } from '../stores'
import { loadCaseChatsQuery, markOrderCaseChatsReadAction } from '../actions'

const inFlightOrderCaseChatLoads = new Map<number, Promise<boolean>>()
const initializedOrderCaseChats = new Set<number>()

type InitializeOrderCaseChatFlowOptions = {
  force?: boolean
}

export async function initializeOrderCaseChatFlow(
  orderCaseId: number,
  options: InitializeOrderCaseChatFlowOptions = {},
) {
  const { force = false } = options

  if (orderCaseId <= 0) {
    return true
  }

  const existingChats = selectCaseChatsByOrderCaseId(useCaseChatsStore.getState(), orderCaseId)
  const orderCase = selectOrderCaseByServerId(orderCaseId)(useOrderCasesStore.getState())

  if (!force && initializedOrderCaseChats.has(orderCaseId)) {
    return true
  }

  if (!force && existingChats.length > 0 && (orderCase?.unseen_chats ?? 0) === 0) {
    initializedOrderCaseChats.add(orderCaseId)
    return true
  }

  const existingRequest = inFlightOrderCaseChatLoads.get(orderCaseId)
  if (existingRequest) {
    return existingRequest
  }

  const request = (async () => {
    try {
      const result = await loadCaseChatsQuery(orderCaseId)
      upsertCaseChats(result.caseChats)
      await markOrderCaseChatsReadAction(orderCaseId)
      updateOrderCaseUnseenCount(orderCaseId, 0)
      initializedOrderCaseChats.add(orderCaseId)
      return true
    } catch (error) {
      console.error('Failed to initialize order case chat', error)
      return false
    } finally {
      inFlightOrderCaseChatLoads.delete(orderCaseId)
    }
  })()

  inFlightOrderCaseChatLoads.set(orderCaseId, request)
  return request
}
