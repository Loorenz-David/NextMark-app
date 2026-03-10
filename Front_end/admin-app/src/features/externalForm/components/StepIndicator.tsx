import { createExternalFormController } from '../controllers/externalForm.controller'
import type { ExternalFormStep } from '../domain/externalForm.types'
import { EXTERNAL_FORM_STEPS } from '../flows/externalForm.flow'
import { useExternalForm } from '../context'

const stepLabels: Record<ExternalFormStep, string> = {
  client_info: 'Client',
  contact_info: 'Contact',
  delivery_address: 'Address',
}

export const StepIndicator = () => {
  const { currentStep, form, goToStep } = useExternalForm()
  const controller = createExternalFormController()

  const currentIndex = EXTERNAL_FORM_STEPS.findIndex((step) => step === currentStep)

  return (
    <nav className="w-full" aria-label="External form steps">
      <ol className="grid grid-cols-3 items-start gap-2 sm:gap-4">
        {EXTERNAL_FORM_STEPS.map((step, index) => {
          const isCurrent = step === currentStep
          const isCompleted = index < currentIndex && controller.canProceed(step, form)

          return (
            <li key={step} className="relative">
              <button
                type="button"
                onClick={() => {
                  goToStep(step)
                }}
                className="flex w-full flex-col items-center gap-2"
              >
                <span
                  className={`flex h-10 w-10 items-center justify-center rounded-full border text-sm font-semibold transition ${
                    isCurrent
                      ? 'border-[var(--color-primary)] bg-[var(--color-primary)] text-white'
                      : isCompleted
                        ? 'border-emerald-600 bg-emerald-600 text-white'
                        : 'border-[var(--color-border)] bg-white text-[var(--color-muted)]'
                  }`}
                >
                  {index + 1}
                </span>
                <span
                  className={`text-xs font-medium sm:text-sm ${
                    isCurrent || isCompleted ? 'text-[var(--color-text)]' : 'text-[var(--color-muted)]'
                  }`}
                >
                  {stepLabels[step]}
                </span>
              </button>
              {index < EXTERNAL_FORM_STEPS.length - 1 && (
                <span className="pointer-events-none absolute left-[calc(50%+1.25rem)] top-5 hidden h-[2px] w-[calc(100%-2.5rem)] bg-[var(--color-border)] sm:block" />
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
