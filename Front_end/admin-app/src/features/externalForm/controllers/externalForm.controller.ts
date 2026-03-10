import type { ExternalFormData, ExternalFormStep } from '../domain/externalForm.types'
import {
  validateClientInfo,
  validateContactInfo,
  validateDeliveryAddress,
} from '../domain/externalForm.validation'
import { emitExternalFormSubmit } from '@/realtime/externalForm/externalForm.realtime'

export const createExternalFormController = () => {
  const canProceed = (step: ExternalFormStep, form: ExternalFormData): boolean => {
    switch (step) {
      case 'client_info':
        return validateClientInfo(form)
      case 'contact_info':
        return validateContactInfo(form)
      case 'delivery_address':
        return validateDeliveryAddress(form)
      default:
        return false
    }
  }

  const submit = (form: ExternalFormData, targetUserId: number) => {
    if (!Number.isFinite(targetUserId) || targetUserId <= 0) {
      return
    }

    console.log('External Form Submitted:', form)
    emitExternalFormSubmit({
      user_id: targetUserId,
      form_data: form,
    })
  }

  return {
    canProceed,
    submit,
  }
}
