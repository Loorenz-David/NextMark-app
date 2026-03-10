import type { StackComponentProps } from '@/shared/stack-manager/types'

import { WarehouseMainPage } from '../pages/WarehouseMainPage'

export type WarehousePageKey = keyof typeof pageRegistry

type ExtractPayload<T> =
  T extends React.ComponentType<StackComponentProps<infer P>>
    ? P
    : never

export type WarehouseSectionPayloads = {
  [K in keyof typeof pageRegistry]: ExtractPayload<(typeof pageRegistry)[K]>
}

export const pageRegistry = {
  'warehouse.main': WarehouseMainPage,
}
