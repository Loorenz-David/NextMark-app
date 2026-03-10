import type { StackComponentProps } from '@/shared/stack-manager/types'
import type { PopupPayload } from '@/features/plan/planTypes/localDelivery/forms/localDeliveryEditForm/LocalDeliveryEditForm.types'
import { LocalDeliveryEditFormPopup } from './LocalDeliveryEditFormPopup'

export const LocalDeliveryEditForm = ({ payload, onClose }: StackComponentProps<PopupPayload>) => (
  <LocalDeliveryEditFormPopup payload={payload} onClose={onClose} />
)
