import type { StackComponentProps } from '@/shared/stack-manager/types'

import { WarehouseForm } from '../popups/WarehouseForm/WarehouseForm'

export type WarehousePopupKey = keyof typeof popupRegistry

type ExtractPayload<T> =
  T extends React.ComponentType<StackComponentProps<infer P>>
    ? P
    : never

export type WarehousePopupPayloads = {
  [K in keyof typeof popupRegistry]: ExtractPayload<(typeof popupRegistry)[K]>
}

export const popupRegistry = {
  'warehouse.form': WarehouseForm,
}
