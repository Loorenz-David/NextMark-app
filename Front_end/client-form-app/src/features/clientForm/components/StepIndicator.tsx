import { useClientForm } from '../context/useClientForm'

const STEPS = [
  { id: 'client_info', label: 'Client Info' },
  { id: 'contact_info', label: 'Contact' },
  { id: 'delivery_address', label: 'Address' },
] as const

export const StepIndicator = () => {
  const { currentStep } = useClientForm()
  const currentIdx = STEPS.findIndex((s) => s.id === currentStep)

  return (
    <div className="flex items-center gap-2">
      {STEPS.map((step, idx) => {
        const isDone = idx < currentIdx
        const isActive = step.id === currentStep
        return (
          <div key={step.id} className="flex items-center gap-2">
            <div
              className={[
                'flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold',
                isActive
                  ? 'bg-[var(--color-primary)] text-white'
                  : isDone
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-[var(--color-surface-2)] text-[var(--color-muted)]',
              ].join(' ')}
            >
              {isDone ? '✓' : idx + 1}
            </div>
            <span
              className={[
                'hidden text-sm sm:block',
                isActive ? 'font-medium text-[var(--color-text)]' : 'text-[var(--color-muted)]',
              ].join(' ')}
            >
              {step.label}
            </span>
            {idx < STEPS.length - 1 && (
              <div className="h-px w-6 bg-[var(--color-border)]" />
            )}
          </div>
        )
      })}
    </div>
  )
}
