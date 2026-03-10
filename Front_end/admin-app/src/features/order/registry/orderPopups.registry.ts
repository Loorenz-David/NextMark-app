import { createElement } from 'react'
import type { StackComponentProps } from '@/shared/stack-manager/types'

import { OrderForm } from '../popups/OrderForm/OrderForm'
import { ItemForm } from '../item'

type ExtractPayload<T> = T extends React.ComponentType<StackComponentProps<infer P>>
  ? P
  : never

const PlaceholderPopup = (_: StackComponentProps<undefined>) => createElement('div')

export const popupRegistry = {
  'order.edit': OrderForm,
  'order.item.create': ItemForm,
  'order.item.edit': ItemForm,
  'order.create': OrderForm,
  FilterForm: PlaceholderPopup,
}

export type PopupKey = keyof typeof popupRegistry

export type OrderPopupPayloads = {
  [K in keyof typeof popupRegistry]: ExtractPayload<(typeof popupRegistry)[K]>
}
