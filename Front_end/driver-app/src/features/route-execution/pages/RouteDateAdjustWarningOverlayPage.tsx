import { useState } from 'react'
import { TriangleWarningIcon } from '@/assets/icons'

type RouteDateAdjustWarningOverlayPageProps = {
  title: string
  message: string
  confirmLabel: string
  onConfirm: () => Promise<boolean>
  onClose: () => void
}

export function RouteDateAdjustWarningOverlayPage({
  title,
  message,
  confirmLabel,
  onConfirm,
  onClose,
}: RouteDateAdjustWarningOverlayPageProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleConfirm() {
    if (isSubmitting) {
      return
    }

    setIsSubmitting(true)
    try {
      await onConfirm()
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="route-date-adjust-overlay">
      <div className="shell-overlay-card route-date-adjust-overlay__card">
        <div className="driver-status-pill route-date-adjust-overlay__icon">
          <TriangleWarningIcon className="size-4" />
        </div>
        <div className="shell-surface__eyebrow">Route schedule warning</div>
        <h2 className="shell-surface__title">{title}</h2>
        <p className="shell-surface__copy">{message}</p>
        <div className="shell-panel-actions route-date-adjust-overlay__actions">
          <button className="ghost-button" onClick={onClose} type="button">
            Cancel
          </button>
          <button
            className="primary-button"
            disabled={isSubmitting}
            onClick={() => { void handleConfirm() }}
            type="button"
          >
            {isSubmitting ? 'Adjusting…' : confirmLabel}
          </button>
        </div>
      </div>
    </section>
  )
}
