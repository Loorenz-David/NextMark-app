import { useClientForm } from '../context/useClientForm'
import { StepButton } from './StepButton'

export const ContactInfoStep = () => {
  const { data, setField, next, goToStep } = useClientForm()

  return (
    <div className="space-y-5">
      <div className="space-y-1">
        <h2 className="text-base font-semibold text-[var(--color-text)]">Contact Information</h2>
        <p className="text-sm text-[var(--color-muted)]">How can the delivery team reach you?</p>
      </div>

      <div className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-[var(--color-text)]">Email</label>
          <input
            type="email"
            className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
            value={data.client_email}
            onChange={(e) => setField('client_email', e.target.value)}
            placeholder="email@example.com"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-[var(--color-text)]">Primary phone</label>
          <input
            type="tel"
            className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
            value={data.client_primary_phone}
            onChange={(e) => setField('client_primary_phone', e.target.value)}
            placeholder="+1 555 000 0000"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-[var(--color-text)]">
            Secondary phone <span className="text-[var(--color-muted)]">(optional)</span>
          </label>
          <input
            type="tel"
            className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
            value={data.client_secondary_phone}
            onChange={(e) => setField('client_secondary_phone', e.target.value)}
            placeholder="+1 555 000 0000"
          />
        </div>
      </div>

      <div className="flex justify-between">
        <StepButton label="Back" variant="ghost" onClick={() => goToStep('client_info')} />
        <StepButton
          label="Next"
          onClick={next}
          disabled={!data.client_email.trim() || !data.client_primary_phone.trim()}
        />
      </div>
    </div>
  )
}
