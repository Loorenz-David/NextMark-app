import type { Item, ItemUpdateFields } from '@/features/order/item'
import type { OrderUpdateFields } from '@/features/order/types/order'
import type { OrderFormState } from '@/features/order/forms/orderForm/state/OrderForm.types'
import { sortDeliveryWindowsUtc } from '@/features/order/forms/orderForm/flows/orderFormDeliveryWindows.flow'

const toNullableString = (value: string | null) => {
  const trimmed = (value ?? '').trim()
  return trimmed ? trimmed : null
}

export const stripImmutableItemFields = (draft: Item): ItemUpdateFields => ({
  article_number: draft.article_number,
  reference_number: draft.reference_number ?? null,
  item_type: draft.item_type,
  properties: draft.properties ?? null,
  page_link: draft.page_link ?? null,
  dimension_depth: draft.dimension_depth ?? null,
  dimension_height: draft.dimension_height ?? null,
  dimension_width: draft.dimension_width ?? null,
  weight: draft.weight ?? null,
  quantity: draft.quantity,
})

export const normalizeFormStateForSave = (state: OrderFormState): OrderUpdateFields => {
  const primaryPhoneNumber = state.client_primary_phone.number.trim()
  const secondaryPhoneNumber = state.client_secondary_phone.number.trim()

  return {
    client_id: state.client_id,
    operation_type: state.operation_type,
    order_plan_objective:
    state.delivery_plan_id == null ? toNullableString(state.order_plan_objective) : null,
    reference_number: state.reference_number.trim(),
    external_source: toNullableString(state.external_source),
    tracking_number: toNullableString(state.tracking_number),
    tracking_link: toNullableString(state.tracking_link),
    client_first_name: state.client_first_name.trim(),
    client_last_name: state.client_last_name.trim(),
    client_email: state.client_email.trim(),
    client_primary_phone: {
      prefix: state.client_primary_phone.prefix,
      number: primaryPhoneNumber,
    },
    client_secondary_phone: secondaryPhoneNumber
      ? {
          prefix: state.client_secondary_phone.prefix,
          number: secondaryPhoneNumber,
        }
      : null,
    client_address: state.client_address,
    earliest_delivery_date: state.earliest_delivery_date,
    latest_delivery_date: state.latest_delivery_date,
    preferred_time_start: state.preferred_time_start || null,
    preferred_time_end: state.preferred_time_end || null,
    delivery_windows: sortDeliveryWindowsUtc(state.delivery_windows),
    delivery_plan_id: state.delivery_plan_id ?? null,
  }
}
