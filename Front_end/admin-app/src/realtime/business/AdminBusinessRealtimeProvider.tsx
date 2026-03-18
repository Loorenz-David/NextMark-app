import type { PropsWithChildren } from 'react'
import { useEffect, useMemo, useSyncExternalStore } from 'react'
import {
  createAdminBusinessChannel,
  type BusinessEventEnvelope,
} from '@shared-realtime'
import { sessionStorage } from '@/features/auth/login/store/sessionStorage'
import { adminRealtimeClient } from '../client'
import { getOrder } from '@/features/order/api/orderApi'
import { useOrderModel } from '@/features/order/domain/useOrderModel'
import {
  selectOrderByServerId,
  updateOrderByClientId,
  upsertOrders,
  useOrderStore,
} from '@/features/order/store/order.store'
import { getOrderCases } from '@/features/orderCase/api/orderCase.api'
import { useOrderCaseFlow } from '@/features/orderCase/flows/orderCase.flow'
import { useOrderCaseModel } from '@/features/orderCase/domain/orderCase.model'
import {
  selectOrderCaseById,
  updateCaseState,
  upsertOrderCase,
  upsertOrderCases,
  useOrderCaseStore,
} from '@/features/orderCase/store/orderCaseStore'
import { useOrderCaseListStore } from '@/features/orderCase/store/orderCaseList.store'
import { useOrderCaseQueryStore } from '@/features/orderCase/store/orderCaseQueryStore'
import {
  markAdminBusinessEventHandled,
  runDedupedGlobalOrderCasesRefresh,
  runDedupedOrderCaseRefresh,
  runDedupedOrderRefresh,
} from './adminBusinessRealtimeCoordinator'

type BusinessPayload = Record<string, unknown>

const resolveTeamId = () => {
  const session = sessionStorage.getSession()
  const rawTeamId = session?.identity?.active_team_id ?? session?.user?.teamId ?? null
  const numericTeamId = Number(rawTeamId)
  return Number.isFinite(numericTeamId) ? numericTeamId : null
}

const getPayloadNumber = (payload: BusinessPayload, key: string): number | null => {
  const value = payload[key]
  return typeof value === 'number' && Number.isFinite(value) ? value : null
}

export function AdminBusinessRealtimeProvider({ children }: PropsWithChildren) {
  const session = useSyncExternalStore(
    sessionStorage.subscribe.bind(sessionStorage),
    () => sessionStorage.getSession(),
    () => sessionStorage.getSession(),
  )

  const adminBusinessChannel = useMemo(
    () => createAdminBusinessChannel(adminRealtimeClient),
    [],
  )
  const { normalizeOrderPayload } = useOrderModel()
  const { normalizeOrderCaseEntity, normalizeOrderCaseMap } = useOrderCaseModel()
  const { loadAllCases } = useOrderCaseFlow()

  useEffect(() => {
    const socketToken = session?.socketToken ?? null
    const teamId = resolveTeamId()

    if (!socketToken || teamId == null) {
      return
    }

    const refreshOrderById = async (orderId: number) => {
      const response = await getOrder(orderId)
      const payload = response.data?.order
      if (!payload) {
        return
      }

      upsertOrders(normalizeOrderPayload(payload))
    }

    const refreshOrderCasesByOrderId = async (orderId: number) => {
      const response = await getOrderCases({ order_id: orderId })
      const normalized = normalizeOrderCaseMap(response.data?.order_cases)
      upsertOrderCases(normalized)
    }

    const refreshGlobalOrderCases = async () => {
      const orderCaseQueryState = useOrderCaseQueryStore.getState()
      const currentQuery = {
        q: orderCaseQueryState.search,
        filters: orderCaseQueryState.filters,
      }
      await loadAllCases(currentQuery, true)
    }

    const handleOrderEvent = (event: BusinessEventEnvelope<BusinessPayload>) => {
      if (
        event.event_name !== 'order.created'
        && event.event_name !== 'order.updated'
        && event.event_name !== 'order.state_changed'
      ) {
        return
      }

      const payload = event.payload ?? {}
      const orderId = getPayloadNumber(payload, 'order_id') ?? event.entity_id
      if (!orderId) {
        return
      }

      const order = selectOrderByServerId(orderId)(useOrderStore.getState())

      if (event.event_name === 'order.state_changed' && order) {
        const nextOrderStateId = getPayloadNumber(payload, 'order_state_id')
        if (nextOrderStateId != null) {
          updateOrderByClientId(order.client_id, (existing) => ({
            ...existing,
            order_state_id: nextOrderStateId,
          }))
        }
      }

      void runDedupedOrderRefresh(orderId, () => refreshOrderById(orderId))
    }

    const handleOrderChatEvent = (event: BusinessEventEnvelope<BusinessPayload>) => {
      if (event.event_name !== 'order_chat.message_created') {
        return
      }

      const payload = event.payload ?? {}
      const orderId = getPayloadNumber(payload, 'order_id')
      if (!orderId) {
        return
      }

      void runDedupedOrderRefresh(orderId, () => refreshOrderById(orderId))
      void runDedupedOrderCaseRefresh(orderId, () => refreshOrderCasesByOrderId(orderId))

      if (useOrderCaseListStore.getState().queryKey) {
        void runDedupedGlobalOrderCasesRefresh(refreshGlobalOrderCases)
      }
    }

    const handleOrderCaseEvent = (event: BusinessEventEnvelope<BusinessPayload>) => {
      if (
        event.event_name !== 'order_case.created'
        && event.event_name !== 'order_case.updated'
        && event.event_name !== 'order_case.state_changed'
      ) {
        return
      }

      const payload = event.payload ?? {}
      const orderId = getPayloadNumber(payload, 'order_id')
      if (!orderId) {
        return
      }

      const order = selectOrderByServerId(orderId)(useOrderStore.getState())
      if (!order) {
        return
      }

      const orderCaseId = getPayloadNumber(payload, 'order_case_id')
      if (event.event_name === 'order_case.state_changed' && orderCaseId) {
        const existingOrderCase = selectOrderCaseById(orderCaseId)(useOrderCaseStore.getState())
        const nextState = payload.state
        if (existingOrderCase && typeof nextState === 'string') {
          updateCaseState(orderCaseId, nextState as typeof existingOrderCase.state)
        }
      }

      if (event.event_name === 'order_case.created' && orderCaseId) {
        const existingOrderCase = selectOrderCaseById(orderCaseId)(useOrderCaseStore.getState())
        if (!existingOrderCase) {
          const normalizedEntity = normalizeOrderCaseEntity({
            id: orderCaseId,
            client_id: String(payload.order_case_client_id ?? `order-case-${orderCaseId}`),
            order_id: orderId,
            state: typeof payload.state === 'string' ? payload.state : 'Open',
            creation_date: String(event.occurred_at),
            unseen_chats: 0,
            chats: [],
          } as never)

          if (normalizedEntity) {
            upsertOrderCase(normalizedEntity)
          }
        }
      }

      void runDedupedOrderRefresh(orderId, () => refreshOrderById(orderId))
      void runDedupedOrderCaseRefresh(orderId, () => refreshOrderCasesByOrderId(orderId))

      if (useOrderCaseListStore.getState().queryKey) {
        void runDedupedGlobalOrderCasesRefresh(refreshGlobalOrderCases)
      }
    }

    const releaseAdminBusiness = adminBusinessChannel.subscribeTeamAdmin((event) => {
      if (!markAdminBusinessEventHandled(event.event_id)) {
        return
      }

      handleOrderEvent(event)
      handleOrderCaseEvent(event)
      handleOrderChatEvent(event)
    })

    return () => {
      releaseAdminBusiness()
    }
  }, [
    adminBusinessChannel,
    loadAllCases,
    normalizeOrderCaseEntity,
    normalizeOrderCaseMap,
    normalizeOrderPayload,
    session,
  ])

  return <>{children}</>
}
