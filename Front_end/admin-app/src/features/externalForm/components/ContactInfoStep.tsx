import { Field } from '@/shared/inputs/FieldContainer'
import { InputField } from '@/shared/inputs/InputField'
import { PhoneField } from '@/shared/inputs/PhoneField/PhoneField'
import type { Phone } from '@/types/phone'

import { useExternalForm } from '../context'
import { StepButton } from './StepButton'

const emptyPhone: Phone = {
  prefix: '+1',
  number: '',
}

const normalizePhone = (value: Phone): Phone | null => {
  return value.number.trim() ? value : null
}

export const ContactInfoStep = () => {
  const { form, setters, next, warnings } = useExternalForm()

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-semibold text-[var(--color-text)]">Contact Information</h2>
        <p className="mt-1 text-sm text-[var(--color-muted)]">Add reachable phone numbers and an email.</p>
      </div>

      <Field
        label="Primary phone:"
        required={true}
        warning={warnings.contactWarning.warning}
      >
        <PhoneField
          phoneNumber={form.client_primary_phone ?? emptyPhone}
          onChange={(value) => {
            setters.setPrimaryPhone(normalizePhone(value))
          }}
        />
      </Field>

      <Field
        label="Secondary phone:"
      >
        <PhoneField
          phoneNumber={form.client_secondary_phone ?? emptyPhone}
          onChange={(value) => {
            setters.setSecondaryPhone(normalizePhone(value))
          }}
        />
      </Field>

      <Field
        label="Email:"
        required={true}
        warningController={warnings.contactWarning}
      >
        <InputField
          type="email"
          placeholder="customer@email.com"
          value={form.client_email}
          onChange={(event) => {
            setters.setEmail(event.target.value)
          }}
          warningController={warnings.contactWarning}
        />
      </Field>

      <div className="pt-2">
        <StepButton label="Next" onClick={next} />
      </div>
    </div>
  )
}
