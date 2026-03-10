import type { ChangeEvent, Dispatch, SetStateAction } from 'react'

import type { ExternalFormData } from '@/features/externalForm/domain/externalForm.types'
import type { address } from '@/types/address'
import type { Phone } from '@/types/phone'
import type { OrderDeliveryWindow } from '../../../types/order'
import type { OrderOperationTypes } from '../../../types/order'
import {
  deriveLegacyFieldsFromDeliveryWindows,
  resolveOrderFormTimeZone,
  sortDeliveryWindowsUtc,
} from '../flows/orderFormDeliveryWindows.flow'

import type { OrderFormState, OrderFormWarnings } from './OrderForm.types'

const normalizeTime = (value: string | null | undefined) => {
  if (!value) return ''

  const [rawHours = '', rawMinutes = ''] = value.split(':')
  const hours = Number(rawHours)
  const minutes = Number(rawMinutes)

  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) {
    return ''
  }

  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
    return ''
  }

  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
}

const normalizeDateBoundary = (
  value: string | null | undefined,
  boundary: 'start' | 'end',
) => {
  if (!value) return null

  const datePart = value.split(/[T\s]/)[0]
  const [yearText, monthText, dayText] = datePart.split('-')
  const year = Number(yearText)
  const month = Number(monthText)
  const day = Number(dayText)

  if (!Number.isFinite(year) || !Number.isFinite(month) || !Number.isFinite(day)) {
    return null
  }

  const date =
    boundary === 'start'
      ? new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0))
      : new Date(Date.UTC(year, month - 1, day, 23, 59, 59, 999))

  return date.toISOString()
}

const normalizeOperationType = (value: string | number): OrderOperationTypes => {
  if (value === 'pickup') return 'pickup'
  if (value === 'pickup_dropoff' || value === 'pickup-dropoff') return 'pickup_dropoff'
  return 'dropoff'
}

export const useOrderFormSetters = ({
  setFormState,
  warnings,
}: {
  setFormState: Dispatch<SetStateAction<OrderFormState>>
  warnings: OrderFormWarnings
}) => {
  const timeZone = resolveOrderFormTimeZone()
  const validateDateRange = (state: OrderFormState) => {
    warnings.dateRangeWarning.validate({
      earliest_delivery_date: state.earliest_delivery_date,
      latest_delivery_date: state.latest_delivery_date,
      preferred_time_start: state.preferred_time_start,
      preferred_time_end: state.preferred_time_end,
    })
    warnings.deliveryWindowsWarning.validate({
      earliest_delivery_date: state.earliest_delivery_date,
      latest_delivery_date: state.latest_delivery_date,
      preferred_time_start: state.preferred_time_start,
      preferred_time_end: state.preferred_time_end,
    })
  }

  const updateFormState = (updater: (prev: OrderFormState) => OrderFormState) => {
    setFormState((prev) => {
      const next = updater(prev)
      validateDateRange(next)
      return next
    })
  }

  const handleOrderPlanObjective = (value: string | null) => {
    updateFormState((prev) => ({ ...prev, order_plan_objective: value }))
  }

  const handleOperationType = (value: string | number) => {
    const normalized = normalizeOperationType(value)
    updateFormState((prev) => ({ ...prev, operation_type: normalized }))
  }

  const handleReference = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value
    updateFormState((prev) => ({ ...prev, reference_number: value }))
    warnings.referenceWarning.validate(value)
  }

  const handleExternalSource = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value
    updateFormState((prev) => ({ ...prev, external_source: value }))
  }

  const handleTrackingNumber = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value
    updateFormState((prev) => ({ ...prev, tracking_number: value }))
  }

  const handleTrackingLink = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value
    updateFormState((prev) => ({ ...prev, tracking_link: value }))
  }

  const handleFirstName = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value
    updateFormState((prev) => ({ ...prev, client_first_name: value }))
    warnings.firstNameWarning.validate(value)
  }

  const handleLastName = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value
    updateFormState((prev) => ({ ...prev, client_last_name: value }))
    warnings.lastNameWarning.validate(value)
  }

  const handleEmail = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value
    updateFormState((prev) => ({ ...prev, client_email: value }))
    warnings.emailWarning.validate(value)
  }

  const handlePrimaryPhone = (value: Phone) => {
    updateFormState((prev) => ({ ...prev, client_primary_phone: value }))
    warnings.primaryPhoneWarning.validate(value)
  }

  const handleSecondaryPhone = (value: Phone) => {
    updateFormState((prev) => ({ ...prev, client_secondary_phone: value }))
  }

  const handleAddress = (value: address | null) => {
    updateFormState((prev) => ({ ...prev, client_address: value }))
    warnings.addressWarning.validate(value)
  }

  const handleEarliestDate = (value: string | null) => {
    const normalized = normalizeDateBoundary(value, 'start')
    updateFormState((prev) => ({ ...prev, earliest_delivery_date: normalized }))
  }

  const handleLatestDate = (value: string | null) => {
    const normalized = normalizeDateBoundary(value, 'end')
    updateFormState((prev) => ({ ...prev, latest_delivery_date: normalized }))
  }

  const handlePreferredTimeStart = (value: string | null) => {
    const normalized = normalizeTime(value)
    updateFormState((prev) => ({ ...prev, preferred_time_start: normalized }))
  }

  const handlePreferredTimeEnd = (value: string | null) => {
    const normalized = normalizeTime(value)
    updateFormState((prev) => ({ ...prev, preferred_time_end: normalized }))
  }

  const mergeExternalClientData = (data: ExternalFormData) => {
    updateFormState((prev) => ({
      ...prev,
      client_first_name: data.client_first_name || prev.client_first_name,
      client_last_name: data.client_last_name || prev.client_last_name,
      client_email: data.client_email || prev.client_email,
      client_primary_phone: data.client_primary_phone ?? prev.client_primary_phone,
      client_secondary_phone: data.client_secondary_phone ?? prev.client_secondary_phone,
      client_address: data.client_address ?? prev.client_address,
    }))
  }

  const handleDeliveryWindows = (windows: OrderDeliveryWindow[]) => {
    const sorted = sortDeliveryWindowsUtc(windows)
    const legacy = deriveLegacyFieldsFromDeliveryWindows(sorted, timeZone)
    updateFormState((prev) => ({
      ...prev,
      delivery_windows: sorted,
      earliest_delivery_date: legacy.earliest_delivery_date,
      latest_delivery_date: legacy.latest_delivery_date,
      preferred_time_start: legacy.preferred_time_start,
      preferred_time_end: legacy.preferred_time_end,
    }))
  }

  return {
    handleOrderPlanObjective,
    handleOperationType,
    handleReference,
    handleExternalSource,
    handleTrackingNumber,
    handleTrackingLink,
    handleFirstName,
    handleLastName,
    handleEmail,
    handlePrimaryPhone,
    handleSecondaryPhone,
    handleAddress,
    handleEarliestDate,
    handleLatestDate,
    handlePreferredTimeStart,
    handlePreferredTimeEnd,
    handleDeliveryWindows,
    mergeExternalClientData,
  }
}
