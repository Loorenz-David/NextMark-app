import type { StackComponentProps } from '@/shared/stack-manager/types'

import { VehicleFormProvider } from './VehicleForm.provider'
import { VehicleFormLayout } from './VehicleForm.layout'
import type { VehicleFormPayload } from './VehicleForm.types'

export const VehicleForm = ({ payload }: StackComponentProps<VehicleFormPayload>) => (
  <VehicleFormProvider payload={payload ?? { mode: 'create' }}>
    <VehicleFormLayout />
  </VehicleFormProvider>
)
