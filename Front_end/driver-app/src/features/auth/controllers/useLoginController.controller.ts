import { useState } from 'react'
import type { FormEvent } from 'react'
import { useSession } from '@/app/providers/session.context'
import type { DriverLoginFormState } from '../domain/loginForm.types'
import { submitDriverLoginAction } from '../actions/submitDriverLogin.action'

const detectTimeZone = () => Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'

export function useLoginController() {
  const { session, sessionState, error, login } = useSession()
  const [formState, setFormState] = useState<DriverLoginFormState>(() => ({
    email: '',
    password: '',
    timeZone: detectTimeZone(),
  }))

  const isSubmitting = sessionState === 'authenticating'

  const updateEmail = (email: string) => {
    setFormState((prev) => ({ ...prev, email }))
  }

  const updatePassword = (password: string) => {
    setFormState((prev) => ({ ...prev, password }))
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    await submitDriverLoginAction(
      { login },
      {
        email: formState.email,
        password: formState.password,
        time_zone: formState.timeZone,
      },
    )
  }

  return {
    isAuthenticated: Boolean(session),
    error,
    isSubmitting,
    formState,
    updateEmail,
    updatePassword,
    handleSubmit,
  }
}
