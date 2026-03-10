import { AddressAutocomplete } from '@/shared/inputs/address-autocomplete/AddressAutocomplete'
import { Field } from '@/shared/inputs/FieldContainer'

import { useExternalForm } from '../context'
import { StepButton } from './StepButton'

export const DeliveryAddressStep = () => {
  const { form, setters, submit, warnings } = useExternalForm()

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-semibold text-[var(--color-text)]">Delivery Address</h2>
        <p className="mt-1 text-sm text-[var(--color-muted)]">Choose where this order should be delivered.</p>
      </div>

      <Field
        label="Address:"
        required={true}
        warning={warnings.addressWarning.warning}
      >
        <AddressAutocomplete
          selectedAddress={form.client_address}
          onSelectedAddress={(value) => {
            setters.setAddress(value)
          }}
        />
      </Field>

      <div className="pt-2">
        <StepButton label="Submit" onClick={submit} />
      </div>
    </div>
  )
}
