import type { FormEventHandler } from 'react'
import type { DriverLoginFormState } from '../domain/loginForm.types'

type LoginFormProps = {
  formState: DriverLoginFormState
  isSubmitting: boolean
  error?: string
  onEmailChange: (value: string) => void
  onPasswordChange: (value: string) => void
  onSubmit: FormEventHandler<HTMLFormElement>
}

export function LoginForm({
  formState,
  isSubmitting,
  error,
  onEmailChange,
  onPasswordChange,
  onSubmit,
}: LoginFormProps) {
  return (
    <form className="driver-form" onSubmit={onSubmit}>
      <label>
        Email
        <input
          value={formState.email}
          onChange={(event) => onEmailChange(event.target.value)}
          type="email"
          required
        />
      </label>
      <label>
        Password
        <input
          value={formState.password}
          onChange={(event) => onPasswordChange(event.target.value)}
          type="password"
          required
        />
      </label>
      <label>
        Time zone
        <input value={formState.timeZone} disabled />
      </label>

      {error ? <p className="form-error">{error}</p> : null}

      <button className="primary-button" type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Signing in…' : 'Sign in'}
      </button>
    </form>
  )
}
