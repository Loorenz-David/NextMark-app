import { useState } from 'react'
import { formatIsoDateFriendly, formatIsoTime } from '@/shared/utils/formatIsoDate'

type Props = {
  formUrl: string
  expiresAt: string
  onClose: () => void
  onRegenerate: () => void
  isRegenerating?: boolean
}

function copyToClipboard(text: string): boolean {
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(text).catch(() => {})
    return true
  }
  const textarea = document.createElement('textarea')
  textarea.value = text
  textarea.style.cssText = 'position:fixed;top:-9999px;left:-9999px;opacity:0'
  document.body.appendChild(textarea)
  textarea.focus()
  textarea.select()
  const ok = document.execCommand('copy')
  document.body.removeChild(textarea)
  return ok
}

export const ClientFormLinkModal = ({
  formUrl,
  expiresAt,
  onClose,
  onRegenerate,
  isRegenerating = false,
}: Props) => {
  const [copied, setCopied] = useState(false)
  const [confirmRegenerate, setConfirmRegenerate] = useState(false)

  const handleCopy = () => {
    const ok = copyToClipboard(formUrl)
    if (ok) {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleRegenerateClick = () => {
    if (!confirmRegenerate) {
      setConfirmRegenerate(true)
      return
    }
    setConfirmRegenerate(false)
    onRegenerate()
  }

  const friendlyDate = formatIsoDateFriendly(expiresAt)
  const friendlyTime = formatIsoTime(expiresAt)
  const expiryLabel = [friendlyDate, friendlyTime].filter(Boolean).join(' at ')

  return (
    <div className="w-full border-t border-[var(--color-border)] bg-white pt-4">
      {/* ── Header ── */}
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-sm font-semibold text-[var(--color-text)]">Client form link</h2>
          <p className="mt-0.5 text-xs text-[var(--color-muted)]">
            Share this link with the client to collect their delivery information.
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="shrink-0 rounded-lg p-1 text-[var(--color-muted)] transition-colors hover:bg-[var(--color-surface)] hover:text-[var(--color-text)]"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      {/* ── URL copy field ── */}
      <div className="mb-2 flex items-center gap-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-2 pl-3">
        <span className="flex-1 truncate text-xs text-[var(--color-text)]">{formUrl}</span>
        <button
          type="button"
          onClick={handleCopy}
          className="shrink-0 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors"
          style={{
            backgroundColor: copied ? '#d1fae5' : 'var(--color-border)',
            color: copied ? '#065f46' : 'var(--color-text)',
          }}
        >
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>

      {/* ── Open in new tab ── */}
      <a
        href={formUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="mb-3 inline-flex items-center gap-1 text-xs text-[var(--color-muted)] transition-colors hover:text-[var(--color-text)]"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
          <polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" />
        </svg>
        Open in new tab
      </a>

      {/* ── Expiry ── */}
      {expiryLabel && (
        <p className="mb-4 text-xs text-[var(--color-muted)]">
          Expires <span className="font-medium text-[var(--color-text)]">{expiryLabel}</span>
        </p>
      )}

      {/* ── Regenerate warning ── */}
      {confirmRegenerate && (
        <div className="mb-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
          ⚠️ This will invalidate the current link. Click &ldquo;Confirm regenerate&rdquo; to proceed.
        </div>
      )}

      {/* ── Footer actions ── */}
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={handleRegenerateClick}
          disabled={isRegenerating}
          className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--color-border)] px-3 py-2 text-xs font-medium text-[var(--color-muted)] transition-colors hover:border-amber-300 hover:text-amber-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isRegenerating ? (
            <><span className="h-3 w-3 animate-spin rounded-full border-2 border-[var(--color-muted)] border-t-transparent" /> Regenerating…</>
          ) : confirmRegenerate ? '⚠️ Confirm regenerate' : 'Regenerate'}
        </button>

        <button
          type="button"
          onClick={onClose}
          className="rounded-xl bg-[var(--color-primary)] px-4 py-2 text-xs font-medium text-white transition-opacity hover:opacity-90"
        >
          Done
        </button>
      </div>
    </div>
  )
}
