import type { ExternalFormData } from '@/features/externalForm/domain/externalForm.types'

import { connectSocket, getSocket } from '../core/socket.manager'
import type { RoomJoinPayload } from '../core/socket.types'

const JOIN_EXTERNAL_FORM_ROOM_EVENT = 'external_form:join_user'
const LEAVE_EXTERNAL_FORM_ROOM_EVENT = 'external_form:leave_user'
const SUBMIT_EXTERNAL_FORM_EVENT = 'external_form:submit_user'
const REQUEST_EXTERNAL_FORM_EVENT = 'external_form:request_user'
const EXTERNAL_FORM_RECEIVED_EVENT = 'external_form:received'
const EXTERNAL_FORM_REQUESTED_EVENT = 'external_form:requested'

export type ExternalFormSubmitPayload = {
  user_id: number
  form_data: ExternalFormData
}

export type ExternalFormRequestPayload = {
  user_id: number
  request_data?: Record<string, unknown>
}

export type ExternalFormReceivedPayload = {
  form_data: ExternalFormData
  submitted_by: number
}

export type ExternalFormRequestedPayload = {
  request_data?: Record<string, unknown>
  requested_by: number
}

export const joinExternalFormUserRoom = (userId: number) => {
  if (!Number.isFinite(userId) || userId <= 0) {
    return
  }

  const payload: RoomJoinPayload = { user_id: userId }
  connectSocket().emit(JOIN_EXTERNAL_FORM_ROOM_EVENT, payload)
}

export const leaveExternalFormUserRoom = (userId: number) => {
  if (!Number.isFinite(userId) || userId <= 0) {
    return
  }

  const payload: RoomJoinPayload = { user_id: userId }
  getSocket().emit(LEAVE_EXTERNAL_FORM_ROOM_EVENT, payload)
}

export const emitExternalFormSubmit = (payload: ExternalFormSubmitPayload) => {
  if (!Number.isFinite(payload.user_id) || payload.user_id <= 0) {
    return
  }

  connectSocket().emit(SUBMIT_EXTERNAL_FORM_EVENT, payload)
}

export const emitExternalFormRequest = (payload: ExternalFormRequestPayload) => {
  if (!Number.isFinite(payload.user_id) || payload.user_id <= 0) {
    return
  }

  connectSocket().emit(REQUEST_EXTERNAL_FORM_EVENT, payload)
}

export const subscribeToExternalFormReceived = (
  handler: (payload: ExternalFormReceivedPayload) => void,
) => {
  getSocket().on(EXTERNAL_FORM_RECEIVED_EVENT, handler)
}

export const unsubscribeFromExternalFormReceived = (
  handler: (payload: ExternalFormReceivedPayload) => void,
) => {
  getSocket().off(EXTERNAL_FORM_RECEIVED_EVENT, handler)
}

export const subscribeToExternalFormRequested = (
  handler: (payload: ExternalFormRequestedPayload) => void,
) => {
  getSocket().on(EXTERNAL_FORM_REQUESTED_EVENT, handler)
}

export const unsubscribeFromExternalFormRequested = (
  handler: (payload: ExternalFormRequestedPayload) => void,
) => {
  getSocket().off(EXTERNAL_FORM_REQUESTED_EVENT, handler)
}
