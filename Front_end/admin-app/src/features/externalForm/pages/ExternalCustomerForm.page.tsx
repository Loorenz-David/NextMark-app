import type { ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { CheckMarkIcon } from '@/assets/icons'

import { ClientInfoStep } from '../components/ClientInfoStep'
import { ContactInfoStep } from '../components/ContactInfoStep'
import { DeliveryAddressStep } from '../components/DeliveryAddressStep'
import { StepIndicator } from '../components/StepIndicator'
import { StepLayout } from '../components/StepLayout'
import { ExternalFormProvider } from '../context/ExternalForm.provider'
import { useExternalForm } from '../context'

type PageLayoutProps = {
  children: ReactNode
}

const PageLayout = ({ children }: PageLayoutProps) => {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-8 sm:px-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold text-[var(--color-text)]">External Customer Form</h1>
        <p className="text-sm text-[var(--color-muted)]">Complete all three steps to submit customer details.</p>
      </header>
      {children}
    </main>
  )
}

const ExternalCustomerFormContent = () => {
  const { currentStep, isFormVisible, hasSubmitted } = useExternalForm()

  return (
    <PageLayout>
      <AnimatePresence mode="wait">
        {isFormVisible ? (
          <motion.div
            key="external-form"
            initial={{ y: -26, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -32, opacity: 0 }}
            transition={{ duration: 0.32, ease: 'easeOut' }}
            className="space-y-6"
          >
            <StepIndicator />
            <StepLayout>
              {currentStep === 'client_info' && <ClientInfoStep />}
              {currentStep === 'contact_info' && <ContactInfoStep />}
              {currentStep === 'delivery_address' && <DeliveryAddressStep />}
            </StepLayout>
          </motion.div>
        ) : hasSubmitted ? (
          <motion.section
            key="external-form-submitted"
            initial={{ y: -14, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -14, opacity: 0 }}
            transition={{ duration: 0.28, ease: 'easeOut' }}
            className="flex min-h-[240px] flex-col items-center justify-center gap-4 rounded-3xl border border-[var(--color-border)] bg-white p-8 text-center shadow-sm"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
              <CheckMarkIcon className="h-7 w-7" />
            </div>
            <p className="text-lg font-semibold text-[var(--color-text)]">Form submitted</p>
            <p className="text-sm text-[var(--color-muted)]">Waiting for a new form request...</p>
          </motion.section>
        ) : (
          <motion.section
            key="external-form-idle"
            initial={{ y: -14, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -14, opacity: 0 }}
            transition={{ duration: 0.28, ease: 'easeOut' }}
            className="rounded-3xl border border-[var(--color-border)] bg-white p-6 text-sm text-[var(--color-muted)] shadow-sm sm:p-8"
          >
            Waiting for form request...
          </motion.section>
        )}
      </AnimatePresence>
    </PageLayout>
  )
}

export const ExternalCustomerFormPage = () => {
  return (
    <ExternalFormProvider>
      <ExternalCustomerFormContent />
    </ExternalFormProvider>
  )
}
