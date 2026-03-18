import { useState, type ReactNode } from 'react'
import { ClientFormContext } from './ClientForm.context'
import type { ClientFormData, ClientFormMeta, ClientFormStep } from '../domain/clientForm.types'
import { isStepValid } from '../domain/clientForm.validation'
import { submitClientForm } from '../../../api/clientForm.api'

const STEPS: ClientFormStep[] = ['client_info', 'contact_info', 'delivery_address']

const EMPTY_DATA: ClientFormData = {
  client_first_name: '',
  client_last_name: '',
  client_primary_phone: '',
  client_secondary_phone: '',
  client_email: '',
  client_address: null,
}

type Props = {
  token: string
  meta: ClientFormMeta
  onSubmitted: () => void
  children: ReactNode
}

export const ClientFormProvider = ({ token, meta, onSubmitted, children }: Props) => {
  const [data, setData] = useState<ClientFormData>(EMPTY_DATA)
  const [currentStep, setCurrentStep] = useState<ClientFormStep>('client_info')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const setField = <K extends keyof ClientFormData>(key: K, value: ClientFormData[K]) => {
    setData((prev) => ({ ...prev, [key]: value }))
  }

  const goToStep = (step: ClientFormStep) => setCurrentStep(step)

  const next = () => {
    const idx = STEPS.indexOf(currentStep)
    if (idx < STEPS.length - 1 && isStepValid(currentStep, data)) {
      setCurrentStep(STEPS[idx + 1])
    }
  }

  const submit = async () => {
    if (!isStepValid('delivery_address', data)) return
    setIsSubmitting(true)
    try {
      await submitClientForm(token, data)
      onSubmitted()
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <ClientFormContext.Provider value={{ meta, data, currentStep, isSubmitting, setField, goToStep, next, submit }}>
      {children}
    </ClientFormContext.Provider>
  )
}
