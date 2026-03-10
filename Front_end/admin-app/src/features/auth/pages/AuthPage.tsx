import { Navigate, useLocation } from 'react-router-dom'

import { AuthSwitch } from '@/features/auth/components/AuthSwitch'
import { LoginForm } from '@/features/auth/login/forms/LoginForm'
import { RegisterForm } from '@/features/auth/register/forms/RegisterForm'
import { useMobile } from '@/app/contexts/MobileContext'

export function AuthPage() {
  const location = useLocation()
  const { isMobile } = useMobile()
  console.log('AuthPage - isMobile:', isMobile)

  if (location.pathname === '/auth') {
    return <Navigate to="/auth/login" replace />
  }

  const isRegister = location.pathname.includes('/auth/register')

  return (
    <div className="grid min-h-dvh grid-cols-1 bg-[var(--color-page)] lg:grid-cols-2">
      <section className="relative hidden flex-col justify-between bg-[var(--color-surface)] p-12 lg:flex">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[var(--color-muted)]">Beyo Delivery</p>
          <h1 className="mt-6 text-4xl font-semibold text-[var(--color-text)]">
            Operational clarity for every delivery team.
          </h1>
          <p className="mt-4 max-w-md text-base text-[var(--color-muted)]">
            Coordinate dispatchers, drivers, and customers from a single responsive control tower.
          </p>
        </div>

        <div className="space-y-4 text-sm text-[var(--color-muted)]">
          <div className="rounded-3xl border border-[var(--color-border)] bg-white p-4 shadow-sm">
            <p className="font-semibold text-[var(--color-text)]">Performance ready</p>
            <p className="mt-2">
              Drag-and-drop manifests, live route insights, and real-time notifications designed for speed.
            </p>
          </div>
          <div className="rounded-3xl border border-[var(--color-border)] bg-white p-4 shadow-sm">
            <p className="font-semibold text-[var(--color-text)]">API driven</p>
            <p className="mt-2">Connect directly to the Flask backend via secure, compressed calls.</p>
          </div>
        </div>
      </section>

      <section className="flex items-center justify-center px-4 py-12 sm:px-6">
        <div className="flex w-full max-w-md flex-col gap-8">
          <div className="space-y-3">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[var(--color-muted)]">Beyo Access</p>
            <h2 className="text-3xl font-semibold text-[var(--color-text)]">
              {isRegister ? 'Create your account' : 'Welcome back'}
            </h2>
            <p className="text-sm text-[var(--color-muted)]">
              {isRegister
                ? 'Set up your workspace in minutes and start dispatching smarter.'
                : 'Sign in to continue managing deliveries with confidence.'}
            </p>
          </div>

          <AuthSwitch />

          <div className="rounded-3xl border border-[var(--color-border)] bg-white p-6 shadow-sm">
            {isRegister ? <RegisterForm /> : <LoginForm />}
          </div>
        </div>
      </section>
    </div>
  )
}
