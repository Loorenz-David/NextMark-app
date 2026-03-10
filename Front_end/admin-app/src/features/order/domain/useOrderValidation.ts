import { validateAddress } from '@/shared/data-validation/addressValidation'
import {
  isDateOnOrAfterToday,
  isDateTimeOnOrAfterNow,
  validateDateComparison,
  validateDateTimeComparison,
  toDateOnly,
} from '@/shared/data-validation/timeValidation'
import { validateEmail, validateString } from '@/shared/data-validation/stringValidation'
import type { address } from '@/types/address'
import type { Phone } from '@/types/phone'

import type { OrderUpdateFields } from '../types/order'
import type { OrderOperationTypes } from '../types/order'
import {
  MAX_ORDER_DELIVERY_WINDOWS,
  sortDeliveryWindowsUtc,
  validateNonOverlappingUtcDeliveryWindows,
} from '../forms/orderForm/flows/orderFormDeliveryWindows.flow'

export const useOrderValidation = () => {
  const validateReferenceNumber = (value: string) => validateString(value)

  const validateOrderPlanObjective = (value: string | null | undefined) =>
    !value || validateString(value)

  const validateOperationType = (value: OrderOperationTypes | null | undefined) =>
    value === 'pickup' || value === 'dropoff' || value === 'pickup_dropoff'

  const validateTrackingNumber = (value: string | null | undefined) =>
    !value || validateString(value)

  const validateTrackingLink = (value: string | null | undefined) =>
    !value || validateString(value)

  const validateExternalSource = (value: string | null | undefined) =>
    !value || validateString(value)

  const validateCustomerName = (value: string) => validateString(value)

  const validateCustomerEmail = (value: string | null | undefined) => {
    if (!value) return true
    return validateEmail(value)
  }

  const validatePhone = (
    value: Phone | null | undefined,
    { required = false }: { required?: boolean } = {},
  ) => {
    if (!value) return !required

    const hasNumber = validateString(value.number)
    if (!hasNumber) return !required

    return validateString(value.prefix)
  }

  const validateAddressValue = (value: address | null | undefined) => validateAddress(value ?? null)

  const validateTimeValue = (
    value: string | null | undefined,
    { required = false }: { required?: boolean } = {},
  ) => {
    if (!value) return !required
    return /^([01]\d|2[0-3]):([0-5]\d)$/.test(value)
  }

  const validateDeliveryWindow = ({
    earliestDeliveryDate,
    latestDeliveryDate,
    preferredTimeStart,
    preferredTimeEnd,
  }: {
    earliestDeliveryDate: string | null | undefined
    latestDeliveryDate: string | null | undefined
    preferredTimeStart: string | null | undefined
    preferredTimeEnd: string | null | undefined
  }) => {
    if (!earliestDeliveryDate || !latestDeliveryDate) return true

    const earliestDateOnly = toDateOnly(earliestDeliveryDate)
    const latestDateOnly = toDateOnly(latestDeliveryDate)

    if (!earliestDateOnly || !latestDateOnly) return true

    if (!validateDateComparison(earliestDateOnly, latestDateOnly)) return false

    return validateDateTimeComparison(
      earliestDeliveryDate,
      preferredTimeStart ?? null,
      latestDeliveryDate,
      preferredTimeEnd ?? null,
    )
  }

  const validateDeliveryWindowNotInPast = ({
    earliestDeliveryDate,
    latestDeliveryDate,
    preferredTimeStart,
    preferredTimeEnd,
  }: {
    earliestDeliveryDate: string | null | undefined
    latestDeliveryDate: string | null | undefined
    preferredTimeStart: string | null | undefined
    preferredTimeEnd: string | null | undefined
  }) => {
    if (earliestDeliveryDate && !isDateOnOrAfterToday(earliestDeliveryDate)) {
      return false
    }

    if (latestDeliveryDate && !isDateOnOrAfterToday(latestDeliveryDate)) {
      return false
    }

    if (!isDateTimeOnOrAfterNow(earliestDeliveryDate, preferredTimeStart ?? null)) {
      return false
    }

    if (!isDateTimeOnOrAfterNow(latestDeliveryDate, preferredTimeEnd ?? null)) {
      return false
    }

    return true
  }

  const validateOrderFields = (fields: OrderUpdateFields) => {
    if ('delivery_windows' in fields) {
      const rows = fields.delivery_windows
      if (!Array.isArray(rows)) {
        return false
      }
      if (rows.length > MAX_ORDER_DELIVERY_WINDOWS) {
        return false
      }
      const normalized = sortDeliveryWindowsUtc(rows)
      const overlapValidation = validateNonOverlappingUtcDeliveryWindows(normalized)
      if (!overlapValidation.valid) {
        return false
      }
      const allRowsValid = normalized.every((row) => {
        if (!row || typeof row !== 'object') return false
        if (typeof row.start_at !== 'string' || typeof row.end_at !== 'string') return false
        if (typeof row.window_type !== 'string' || !row.window_type) return false
        const start = Date.parse(row.start_at)
        const end = Date.parse(row.end_at)
        if (Number.isNaN(start) || Number.isNaN(end)) return false
        return end > start
      })
      if (!allRowsValid) {
        return false
      }
    }

    if ('order_plan_objective' in fields) {
      if (!validateOrderPlanObjective(fields.order_plan_objective)) {
        return false
      }
    }

    if ('operation_type' in fields) {
      if (!validateOperationType(fields.operation_type)) {
        return false
      }
    }

    if ('reference_number' in fields) {
      if (!validateReferenceNumber(String(fields.reference_number ?? ''))) {
        return false
      }
    }

    if ('external_source' in fields) {
      if (!validateExternalSource(fields.external_source)) {
        return false
      }
    }

    if ('tracking_number' in fields) {
      if (!validateTrackingNumber(fields.tracking_number)) {
        return false
      }
    }

    if ('tracking_link' in fields) {
      if (!validateTrackingLink(fields.tracking_link)) {
        return false
      }
    }

    if ('client_first_name' in fields) {
      if (!validateCustomerName(String(fields.client_first_name ?? ''))) {
        return false
      }
    }

    if ('client_last_name' in fields) {
      if (!validateCustomerName(String(fields.client_last_name ?? ''))) {
        return false
      }
    }

    if ('client_email' in fields) {
      if (!validateCustomerEmail(fields.client_email)) {
        return false
      }
    }

    if ('client_primary_phone' in fields) {
      if (!validatePhone(fields.client_primary_phone, { required: true })) {
        return false
      }
    }

    if ('client_secondary_phone' in fields) {
      if (!validatePhone(fields.client_secondary_phone)) {
        return false
      }
    }

    if ('client_address' in fields) {
      if (!validateAddressValue(fields.client_address)) {
        return false
      }
    }

    if ('earliest_delivery_date' in fields) {
      if (
        fields.earliest_delivery_date &&
        !validateString(String(fields.earliest_delivery_date))
      ) {
        return false
      }
    }

    if ('latest_delivery_date' in fields) {
      if (
        fields.latest_delivery_date &&
        !validateString(String(fields.latest_delivery_date))
      ) {
        return false
      }
    }

    if ('preferred_time_start' in fields) {
      if (!validateTimeValue(fields.preferred_time_start, { required: false })) {
        return false
      }
    }

    if ('preferred_time_end' in fields) {
      if (!validateTimeValue(fields.preferred_time_end, { required: false })) {
        return false
      }
    }

    const hasAnyDeliveryWindowField =
      'earliest_delivery_date' in fields ||
      'latest_delivery_date' in fields ||
      'preferred_time_start' in fields ||
      'preferred_time_end' in fields

    if (hasAnyDeliveryWindowField) {
      const isWindowValid = validateDeliveryWindow({
        earliestDeliveryDate: fields.earliest_delivery_date ?? null,
        latestDeliveryDate: fields.latest_delivery_date ?? null,
        preferredTimeStart: fields.preferred_time_start ?? null,
        preferredTimeEnd: fields.preferred_time_end ?? null,
      })
      const isWindowNotInPast = validateDeliveryWindowNotInPast({
        earliestDeliveryDate: fields.earliest_delivery_date ?? null,
        latestDeliveryDate: fields.latest_delivery_date ?? null,
        preferredTimeStart: fields.preferred_time_start ?? null,
        preferredTimeEnd: fields.preferred_time_end ?? null,
      })
      if (!isWindowValid || !isWindowNotInPast) {
        return false
      }
    }

    return true
  }

  return {
    validateReferenceNumber,
    validateOrderPlanObjective,
    validateOperationType,
    validateTrackingNumber,
    validateTrackingLink,
    validateExternalSource,
    validateCustomerName,
    validateCustomerEmail,
    validatePhone,
    validateAddressValue,
    validateTimeValue,
    validateDeliveryWindow,
    validateDeliveryWindowNotInPast,
    validateOrderFields,
  }
}
