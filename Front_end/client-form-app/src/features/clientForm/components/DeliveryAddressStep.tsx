import { useClientForm } from '../context/useClientForm'
import { StepButton } from './StepButton'
import type { ClientAddress } from '../domain/clientForm.types'

// TODO: replace individual inputs with the shared address component if extracted from admin-app

export const DeliveryAddressStep = () => {
  const { data, setField, goToStep, submit } = useClientForm()

  const address = data.client_address ?? { street: '', city: '', state: '', postal_code: '', country: '', notes: '' }

  const setAddress = (patch: Partial<ClientAddress>) => {
    setField('client_address', { ...address, ...patch })
  }

  const isValid = !!address.street.trim() && !!address.city.trim() && !!address.postal_code.trim() && !!address.country.trim()

  return (
    <div className="space-y-5">
      <div className="space-y-1">
        <h2 className="text-base font-semibold text-[var(--color-text)]">Delivery Address</h2>
        <p className="text-sm text-[var(--color-muted)]">Where should the order be delivered?</p>
      </div>

      <div className="space-y-4">
        {(
          [
            { key: 'street', label: 'Street address', placeholder: '123 Main St' },
            { key: 'city', label: 'City', placeholder: 'New York' },
            { key: 'state', label: 'State / Province', placeholder: 'NY', optional: true },
            { key: 'postal_code', label: 'Postal code', placeholder: '10001' },
            { key: 'country', label: 'Country', placeholder: 'United States' },
            { key: 'notes', label: 'Delivery notes', placeholder: 'Ring doorbell, apartment 4B…', optional: true },
          ] as const
        ).map(({ key, label, placeholder, optional }) => (
          <div key={key} className="space-y-1.5">
            <label className="text-sm font-medium text-[var(--color-text)]">
              {label}{' '}
              {optional && <span className="text-[var(--color-muted)]">(optional)</span>}
            </label>
            <input
              className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
              value={address[key]}
              onChange={(e) => setAddress({ [key]: e.target.value })}
              placeholder={placeholder}
            />
          </div>
        ))}
      </div>

      <div className="flex justify-between">
        <StepButton label="Back" variant="ghost" onClick={() => goToStep('contact_info')} />
        <StepButton label="Submit" onClick={submit} disabled={!isValid} />
      </div>
    </div>
  )
}
