import { REALTIME_SERVER_EVENTS, type ClientFormSubmittedPayload } from '../contracts'
import type { SharedRealtimeClient } from '../core/client'

/**
 * Channel for listening to client_form:submitted events in the admin-app.
 *
 * The event fires when a client completes the public form on the external operations app.
 * The admin must be subscribed to the team_admin channel to receive it.
 *
 * Usage:
 *   const channel = createClientFormChannel(realtimeClient)
 *   const unsubscribe = channel.onSubmitted((payload) => {
 *     // payload.order_id, payload.order_reference
 *   })
 */
export const createClientFormChannel = (client: SharedRealtimeClient) => ({
  onSubmitted: (handler: (payload: ClientFormSubmittedPayload) => void) =>
    client.on<ClientFormSubmittedPayload>(REALTIME_SERVER_EVENTS.clientFormSubmitted, handler),
})
