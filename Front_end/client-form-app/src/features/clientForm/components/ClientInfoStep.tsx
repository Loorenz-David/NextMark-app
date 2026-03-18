import { useClientForm } from '../context/useClientForm'
import { StepButton } from './StepButton'

export const ClientInfoStep = () => {
  const { data, setField, next } = useClientForm()

  return (
    <div className="space-y-5">
      <div className="space-y-1">
        <h2 className="text-base font-semibold text-[var(--color-text)]">Client Information</h2>
        <p className="text-sm text-[var(--color-muted)]">Enter the client's full name.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-[var(--color-text)]">First name</label>
          <input
            className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
            value={data.client_first_name}
            onChange={(e) => setField('client_first_name', e.target.value)}
            placeholder="First name"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-[var(--color-text)]">Last name</label>
          <input
            className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
            value={data.client_last_name}
            onChange={(e) => setField('client_last_name', e.target.value)}
            placeholder="Last name"
          />
        </div>
      </div>

      <div className="flex justify-end">
        <StepButton
          label="Next"
          onClick={next}
          disabled={!data.client_first_name.trim() || !data.client_last_name.trim()}
        />
      </div>
    </div>
  )
}
