import { useNavigate } from 'react-router-dom'

import { BasicButton } from '@/shared/buttons/BasicButton'

export const ExternalFormAccessPage = () => {
  const navigate = useNavigate()

  return (
    <div className="flex h-full w-full items-center justify-center bg-[var(--color-page)] p-6">
      <section className="w-full max-w-xl rounded-3xl border border-[var(--color-border)] bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-semibold text-[var(--color-text)]">External Form Access</h1>
        <p className="mt-2 text-sm text-[var(--color-muted)]">
          Open the external customer form page.
        </p>

        <div className="mt-6">
          <BasicButton
            params={{
              variant: 'primary',
              onClick: () => {
                navigate('/external-form')
              },
            }}
          >
            Go to External Form
          </BasicButton>
        </div>
      </section>
    </div>
  )
}
