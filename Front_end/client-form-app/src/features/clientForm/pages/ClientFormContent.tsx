import { AnimatePresence, motion } from 'framer-motion'
import { useClientForm } from '../context/useClientForm'
import { StepIndicator } from '../components/StepIndicator'
import { StepLayout } from '../components/StepLayout'
import { ClientInfoStep } from '../components/ClientInfoStep'
import { ContactInfoStep } from '../components/ContactInfoStep'
import { DeliveryAddressStep } from '../components/DeliveryAddressStep'

// Mirror of ExternalCustomerForm.page.tsx from admin-app
export const ClientFormContent = () => {
  const { currentStep, meta } = useClientForm()

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-8 sm:px-6">
      <header className="space-y-1">
        <p className="text-xs font-medium uppercase tracking-wide text-[var(--color-muted)]">
          {meta.team_name}
        </p>
        <h1 className="text-2xl font-semibold text-[var(--color-text)]">
          Order {meta.reference_number}
        </h1>
        <p className="text-sm text-[var(--color-muted)]">
          Please complete all three steps to confirm your delivery details.
        </p>
      </header>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ y: -16, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -16, opacity: 0 }}
          transition={{ duration: 0.28, ease: 'easeOut' }}
          className="space-y-6"
        >
          <StepIndicator />
          <StepLayout>
            {currentStep === 'client_info' && <ClientInfoStep />}
            {currentStep === 'contact_info' && <ContactInfoStep />}
            {currentStep === 'delivery_address' && <DeliveryAddressStep />}
          </StepLayout>
        </motion.div>
      </AnimatePresence>
    </main>
  )
}
