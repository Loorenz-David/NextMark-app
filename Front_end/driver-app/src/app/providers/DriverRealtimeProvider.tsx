import type { PropsWithChildren } from 'react'
import { useEffect, useMemo } from 'react'
import {
  createRouteOrdersChannel,
  createTeamMembersChannel,
  type BusinessEventEnvelope,
} from '@shared-realtime'
import type { SessionSnapshot } from '@shared-api'
import { useWorkspace } from './workspace.context'
import { useSession } from './session.context'
import { driverRealtimeClient } from '@/app/services/realtime'
import { patchOrderStateByServerIds, selectOrderByServerId, useOrdersStore } from '@/features/routes/orders'
import { initializeOrderCaseChatFlow } from '@/features/order-case'
import {
  selectSelectedRoute,
  useRoutesSelectionStore,
  useRoutesStore,
} from '@/features/routes'
import {
  markDriverRealtimeEventHandled,
  refreshDriverRealtimeOrderCases,
  refreshDriverRealtimeRoutes,
} from '@/app/realtime/driverRealtimeCoordinator'

type BusinessPayload = Record<string, unknown>

const isRealtimeReady = (
  sessionState: string,
  session: SessionSnapshot | null,
  teamId: string | null,
  canExecuteRoutes: boolean,
) => {
  return sessionState === 'authenticated'
    && Boolean(session?.socketToken)
    && Boolean(teamId)
    && canExecuteRoutes
}

const getPayloadNumber = (payload: BusinessPayload, key: string): number | null => {
  const value = payload[key]
  return typeof value === 'number' && Number.isFinite(value) ? value : null
}

export function DriverRealtimeProvider({ children }: PropsWithChildren) {
  const { session, sessionState } = useSession()
  const { workspace } = useWorkspace()
  const routesState = useRoutesStore((state) => state)
  const routesSelectionState = useRoutesSelectionStore((state) => state)
  const selectedRoute = useMemo(
    () => selectSelectedRoute(routesSelectionState, routesState),
    [routesSelectionState, routesState],
  )

  const routeOrdersChannel = useMemo(
    () => createRouteOrdersChannel(driverRealtimeClient),
    [],
  )

  const teamMembersChannel = useMemo(
    () => createTeamMembersChannel(driverRealtimeClient),
    [],
  )

  useEffect(() => {
    const canExecuteRoutes = workspace?.capabilities.canExecuteRoutes ?? false
    const teamId = workspace?.teamId ?? null
    const workspaceScopeKey = workspace?.workspaceScopeKey
    const routeId = selectedRoute?.id ?? null

    if (!workspaceScopeKey || !routeId || !isRealtimeReady(sessionState, session, teamId, canExecuteRoutes)) {
      return
    }

    const handleRouteBusinessEvent = (event: BusinessEventEnvelope<BusinessPayload>) => {
      if (!markDriverRealtimeEventHandled(event.event_id)) {
        return
      }

      const payload = event.payload ?? {}
      const orderId = getPayloadNumber(payload, 'order_id')

      if (event.event_name === 'order.updated' || event.event_name === 'order.state_changed') {
        const resolvedOrderId = orderId ?? event.entity_id
        if (!resolvedOrderId) {
          return
        }

        const order = selectOrderByServerId(resolvedOrderId)(useOrdersStore.getState())
        if (!order) {
          return
        }

        if (event.event_name === 'order.state_changed') {
          const orderStateId = getPayloadNumber(payload, 'order_state_id')
          if (orderStateId != null) {
            patchOrderStateByServerIds([resolvedOrderId], orderStateId)
          }
        }

        void refreshDriverRealtimeRoutes(workspaceScopeKey)
        return
      }

      if (
        event.event_name === 'order_case.created'
        || event.event_name === 'order_case.updated'
        || event.event_name === 'order_case.state_changed'
        || event.event_name === 'order_chat.message_created'
      ) {
        if (!orderId) {
          return
        }

        const order = selectOrderByServerId(orderId)(useOrdersStore.getState())
        if (!order) {
          return
        }

        const orderCaseId = getPayloadNumber(payload, 'order_case_id')
        if (event.event_name === 'order_chat.message_created' && orderCaseId != null) {
          void initializeOrderCaseChatFlow(orderCaseId, { force: true })
        }

        void refreshDriverRealtimeOrderCases(orderId)
      }
    }

    const releaseRouteOrders = routeOrdersChannel.subscribeRouteOrders(routeId, handleRouteBusinessEvent)

    return () => {
      releaseRouteOrders()
    }
  }, [
    routeOrdersChannel,
    session,
    sessionState,
    selectedRoute?.id,
    workspace,
  ])

  useEffect(() => {
    const teamId = workspace?.teamId ?? null
    const workspaceScopeKey = workspace?.workspaceScopeKey

    if (
      !workspaceScopeKey
      || sessionState !== 'authenticated'
      || !session?.socketToken
      || !teamId
    ) {
      return
    }

    const currentUserId = workspace?.userId ?? session?.identity?.user_id ?? session?.user?.id ?? null

    const releaseTeamMembers = teamMembersChannel.subscribeTeamMembers((event: BusinessEventEnvelope<BusinessPayload>) => {
      if (!markDriverRealtimeEventHandled(event.event_id)) {
        return
      }

      const payload = event.payload ?? {}

      if (event.event_name === 'route_solution.created') {
        const driverId = getPayloadNumber(payload, 'driver_id')
        if (driverId == null || currentUserId == null) {
          return
        }

        if (String(driverId) !== String(currentUserId)) {
          return
        }

        void refreshDriverRealtimeRoutes(workspaceScopeKey)
        return
      }

      if (event.event_name === 'local_delivery_plan.updated') {
        const driverId = getPayloadNumber(payload, 'driver_id')
        if (driverId == null || currentUserId == null) {
          return
        }

        if (String(driverId) !== String(currentUserId)) {
          return
        }

        void refreshDriverRealtimeRoutes(workspaceScopeKey)
      }
    })

    return () => {
      releaseTeamMembers()
    }
  }, [
    teamMembersChannel,
    session,
    sessionState,
    workspace,
  ])

  return <>{children}</>
}
