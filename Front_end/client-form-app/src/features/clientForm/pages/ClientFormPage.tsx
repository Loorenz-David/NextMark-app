import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ClientFormProvider } from '../context/ClientForm.provider'
import { ClientFormContent } from './ClientFormContent'
import type { ClientFormMeta, ClientFormStatus } from '../domain/clientForm.types'
import { fetchClientForm } from '../../../api/clientForm.api'
import { CheckMarkIcon } from '../../../assets/icons/CheckMarkIcon'

interface Props {
  token: string
}

export const ClientFormPage = ({ token }: Props) => {
  const [status, setStatus] = useState<ClientFormStatus>({ state: 'loading' })
  const [meta, setMeta] = useState<ClientFormMeta | null>(null)

  useEffect(() => {
    fetchClientForm(token)
      .then((data) => {
        setMeta(data)
        setStatus({ state: 'ready' })
      })
      .catch((err: { status?: number }) => {
        if (err?.status === 410) setStatus({ state: 'expired' })
        else if (err?.status === 409) setStatus({ state: 'already_submitted' })
        else setStatus({ state: 'invalid' })
      })
  }, [token])

  if (status.state === 'loading') {
    return (
      <main className="mx-auto flex w-full max-w-3xl px-4 py-8">
        <p className="text-sm text-[var(--color-muted)]">Loading…</p>
      </main>
    )
  }

  if (status.state === 'expired') {
    return (
      <main className="mx-auto flex w-full max-w-3xl flex-col gap-4 px-4 py-8">
        <h1 className="text-xl font-semibold text-[var(--color-text)]">Link expired</h1>
        <p className="text-sm text-[var(--color-muted)]">
          This form link has expired. Please contact the sender to request a new one.
        </p>
      </main>
    )
  }

  if (status.state === 'already_submitted') {
    return (
      <main className="mx-auto flex w-full max-w-3xl flex-col items-center gap-4 px-4 py-8 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
            <CheckMarkIcon className="h-7 w-7" />
          </div>
          <p className="text-lg font-semibold text-[var(--color-text)]">Already submitted</p>
        <p className="text-sm text-[var(--color-muted)]">Your information has already been received. Thank you!</p>
      </main>
    )
  }

  if (status.state === 'submitted') {
    return (
      <AnimatePresence>
        <motion.main
          initial={{ y: -14, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="mx-auto flex w-full max-w-3xl flex-col items-center gap-4 px-4 py-8 text-center"
        >
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
            <CheckMarkIcon className="h-7 w-7" />
          </div>
          <p className="text-lg font-semibold text-[var(--color-text)]">Form submitted</p>
          <p className="text-sm text-[var(--color-muted)]">Your information has been received. Thank you!</p>
        </motion.main>
      </AnimatePresence>
    )
  }

  if (status.state === 'invalid' || !meta) {
    return (
      <main className="mx-auto flex w-full max-w-3xl px-4 py-8">
        <p className="text-sm text-[var(--color-muted)]">This link is not valid.</p>
      </main>
    )
  }

  return (
    <ClientFormProvider
      token={token}
      meta={meta}
      onSubmitted={() => setStatus({ state: 'submitted' })}
    >
      <ClientFormContent />
    </ClientFormProvider>
  )
}
