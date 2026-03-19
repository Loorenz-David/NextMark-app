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
      <div className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-[#131a1b]">
        <div className="cf-aurora cf-aurora--one" aria-hidden="true" />
        <p className="relative z-10 text-sm text-white/46">Loading…</p>
      </div>
    )
  }

  if (status.state === 'expired') {
    return (
      <div className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-[#131a1b] px-4">
        <div className="cf-aurora cf-aurora--one" aria-hidden="true" />
        <div className="relative z-10 max-w-sm space-y-3 text-center">
          <h1 className="text-xl font-semibold text-white/90">Link expired</h1>
          <p className="text-sm text-white/46">This form link has expired. Please contact the sender to request a new one.</p>
        </div>
      </div>
    )
  }

  if (status.state === 'already_submitted') {
    return (
      <div className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-[#131a1b] px-4">
        <div className="cf-aurora cf-aurora--one" aria-hidden="true" />
        <div className="relative z-10 flex max-w-sm flex-col items-center gap-4 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full border border-[#83ccb9]/30 bg-[#83ccb9]/15 shadow-[0_0_24px_rgba(131,204,185,0.3)]">
            <CheckMarkIcon className="h-7 w-7 text-[#83ccb9]" />
          </div>
          <p className="text-lg font-semibold text-white/90">Already submitted</p>
          <p className="text-sm text-white/46">Your information has already been received. Thank you!</p>
        </div>
      </div>
    )
  }

  if (status.state === 'submitted') {
    return (
      <div className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-[#131a1b] px-4">
        <div className="cf-aurora cf-aurora--one" aria-hidden="true" />
        <div className="cf-aurora cf-aurora--two" aria-hidden="true" />
        <AnimatePresence>
          <motion.div
            initial={{ y: -14, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="relative z-10 flex max-w-sm flex-col items-center gap-4 text-center"
          >
            <motion.div
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1, type: 'spring', stiffness: 260, damping: 18 }}
              className="flex h-16 w-16 items-center justify-center rounded-full border border-[#83ccb9]/30 bg-[#83ccb9]/15 shadow-[0_0_32px_rgba(131,204,185,0.40)]"
            >
              <CheckMarkIcon className="h-8 w-8 text-[#83ccb9]" />
            </motion.div>
            <p className="text-xl font-semibold text-white/90">Form submitted</p>
            <p className="text-sm text-white/46">Your information has been received. Thank you!</p>
          </motion.div>
        </AnimatePresence>
      </div>
    )
  }

  if (status.state === 'invalid' || !meta) {
    return (
      <div className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-[#131a1b] px-4">
        <div className="cf-aurora cf-aurora--one" aria-hidden="true" />
        <p className="relative z-10 text-sm text-white/46">This link is not valid.</p>
      </div>
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
