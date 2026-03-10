import type { StackComponentProps } from '@/shared/stack-manager/types'

import { WarehouseFormProvider } from './WarehouseForm.provider'
import { WarehouseFormLayout } from './WarehouseForm.layout'
import type { WarehouseFormPayload } from './WarehouseForm.types'

export const WarehouseForm = ({ payload }: StackComponentProps<WarehouseFormPayload>) => (
  <WarehouseFormProvider payload={payload ?? { mode: 'create' }}>
    <WarehouseFormLayout />
  </WarehouseFormProvider>
)
