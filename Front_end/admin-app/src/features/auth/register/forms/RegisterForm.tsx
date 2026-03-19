import { useState } from 'react'

import { Field } from '@/shared/inputs/FieldContainer'
import { InputField } from '@/shared/inputs/InputField'
import { PhoneField } from '@/shared/inputs/PhoneField'
import type { Phone } from '@/types/phone'
import { DEFAULT_PREFIX } from '@/constants/dropDownOptions'
import { BasicButton } from '@/shared/buttons/BasicButton'

import { useRegisterMutations } from '@/features/auth/register/hooks/useRegisterMutations'
import { useRegisterError, useRegisterLoading } from '@/features/auth/register/hooks/useRegisterSelectors'
import { useNavigate } from 'react-router-dom'

const detectTimeZone = () => Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'

export function RegisterForm() {
  const navidate = useNavigate()
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [phone, setPhone] = useState<Phone>({ prefix: DEFAULT_PREFIX, number: '' })
  const { register } = useRegisterMutations()
  const isLoading = useRegisterLoading()
  const error = useRegisterError()


  async function handleSubmit() {
    const outcome = await register({
      username,
      email,
      password,
      phone_number: phone,
      time_zone: detectTimeZone(),
    })

    if (outcome) {
      navidate('/auth/login')
    }
  }


  return (
    <form
      className="flex w-full flex-col gap-6"
      onSubmit={(event) => {
        event.preventDefault()
        handleSubmit()
      }}
    >
      <div className="space-y-4">
        <Field label="Name" required>
          <InputField
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            placeholder="Jane Doe"
            autoComplete="name"
          />
        </Field>

        <Field label="Email" required>
          <InputField
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            type="email"
            placeholder="name@company.com"
            autoComplete="email"
          />
        </Field>

        <PhoneField
          phoneNumber={phone}
          onChange={setPhone}
        />

        <Field label="Password" required>
          <InputField
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            type="password"
            placeholder="Create a password"
            autoComplete="new-password"
          />
        </Field>
      </div>

      {error && (
        <div className="rounded-2xl border border-rose-300/24 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">
          {error}
        </div>
      )}

      <BasicButton
        params={{
          type: 'submit',
          variant: 'primary',
          disabled: isLoading || !username || !email || !password || !phone.number,
          className: 'h-12 w-full text-base shadow-[0_18px_38px_rgba(131,204,185,0.24)]',
        }}
      >
        {isLoading ? 'Creating account...' : 'Create account'}
      </BasicButton>
    </form>
  )
}
