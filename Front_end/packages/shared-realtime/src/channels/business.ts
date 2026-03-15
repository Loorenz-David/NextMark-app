import {
  REALTIME_CHANNELS,
  REALTIME_SERVER_EVENTS,
  type BusinessEventEnvelope,
} from '../contracts'
import type { SharedRealtimeClient } from '../core/client'

const isBusinessEventEnvelope = (payload: unknown): payload is BusinessEventEnvelope => {
  if (!payload || typeof payload !== 'object') {
    return false
  }

  return typeof (payload as BusinessEventEnvelope).event_name === 'string'
    && typeof (payload as BusinessEventEnvelope).event_id === 'string'
}

export const createOrdersChannel = (client: SharedRealtimeClient) => ({
  subscribeTeamOrders: (handler: (event: BusinessEventEnvelope) => void) => {
    const releaseChannel = client.subscribe(REALTIME_CHANNELS.teamOrders, {})
    const releaseListener = client.on<BusinessEventEnvelope>(REALTIME_SERVER_EVENTS.businessEvent, (event) => {
      if (!isBusinessEventEnvelope(event)) {
        return
      }

      if (event.event_name === 'order.created' || event.event_name === 'order.updated' || event.event_name === 'order.state_changed') {
        handler(event)
      }
    })

    return () => {
      releaseListener()
      releaseChannel()
    }
  },
})

export const createOrderCasesChannel = (client: SharedRealtimeClient) => ({
  subscribeTeamOrderCases: (handler: (event: BusinessEventEnvelope) => void) => {
    const releaseChannel = client.subscribe(REALTIME_CHANNELS.teamOrderCases, {})
    const releaseListener = client.on<BusinessEventEnvelope>(REALTIME_SERVER_EVENTS.businessEvent, (event) => {
      if (!isBusinessEventEnvelope(event)) {
        return
      }

      if (
        event.event_name === 'order_case.created'
        || event.event_name === 'order_case.updated'
        || event.event_name === 'order_case.state_changed'
      ) {
        handler(event)
      }
    })

    return () => {
      releaseListener()
      releaseChannel()
    }
  },
})

export const createRouteOrdersChannel = (client: SharedRealtimeClient) => ({
  subscribeRouteOrders: (routeId: number, handler: (event: BusinessEventEnvelope) => void) => {
    const releaseChannel = client.subscribe(REALTIME_CHANNELS.routeOrders, { route_id: routeId })
    const releaseListener = client.on<BusinessEventEnvelope>(REALTIME_SERVER_EVENTS.businessEvent, (event) => {
      if (!isBusinessEventEnvelope(event)) {
        return
      }

      if (
        event.event_name === 'order.updated'
        || event.event_name === 'order.state_changed'
        || event.event_name === 'order_case.created'
        || event.event_name === 'order_case.updated'
        || event.event_name === 'order_case.state_changed'
        || event.event_name === 'order_chat.message_created'
      ) {
        handler(event)
      }
    })

    return () => {
      releaseListener()
      releaseChannel()
    }
  },
})

export const createOrderChatChannel = (client: SharedRealtimeClient) => ({
  subscribeOrderChat: (orderId: number, handler: (event: BusinessEventEnvelope) => void) => {
    const releaseChannel = client.subscribe(REALTIME_CHANNELS.orderChat, { order_id: orderId })
    const releaseListener = client.on<BusinessEventEnvelope>(REALTIME_SERVER_EVENTS.businessEvent, (event) => {
      if (!isBusinessEventEnvelope(event) || event.event_name !== 'order_chat.message_created') {
        return
      }

      if ((event.payload as Record<string, unknown>)?.order_id !== orderId) {
        return
      }

      handler(event)
    })

    return () => {
      releaseListener()
      releaseChannel()
    }
  },
})
