import type { ReactNode } from 'react'

import type { Order } from '../types/order'
import { ClientFormLinkButton } from './clientFormLink/ClientFormLinkButton'
import { ClientFormLinkStatus } from './clientFormLink/ClientFormLinkStatus'

type OrderDetailTrackingProps = {
  order: Order | null
}

type TrackingRowProps = {
  label: string
  value: ReactNode
  actions?: ReactNode
}

type InlineActionButtonProps = {
  children: ReactNode
  onClick: () => void
}

const asText = (value?: string | null) => value || '—'

const copyToClipboard = (value: string) => {
  void navigator.clipboard.writeText(value)
}

export const OrderDetailTracking = ({ order }: OrderDetailTrackingProps) => {
  return (
    <div
      className="admin-glass-panel flex h-[420px] flex-col overflow-hidden rounded-[26px] border-white/10"
      style={{ boxShadow: 'none' }}
    >
      <div className="admin-glass-divider border-b px-5 py-4">
        <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-[var(--color-muted)]">
          Tracking And Client Form
        </p>
      </div>

      <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-5 py-4.5 scroll-thin">
        <TrackingRow
          label="Tracking number"
          value={<span className="font-mono text-[0.95rem] text-[var(--color-text)]">{asText(order?.tracking_number)}</span>}
          actions={
            order?.tracking_number ? (
              <InlineActionButton onClick={() => copyToClipboard(order.tracking_number!)}>
                Copy
              </InlineActionButton>
            ) : null
          }
        />

        {order?.tracking_link ? (
          <TrackingRow
            label="Tracking link"
            value={
              <a
                href={order.tracking_link}
                target="_blank"
                rel="noopener noreferrer"
                className="block truncate text-sm text-[var(--color-primary)] transition-colors hover:text-white"
              >
                {order.tracking_link}
              </a>
            }
            actions={
              <div className="flex items-center gap-2">
                <InlineActionButton onClick={() => copyToClipboard(order.tracking_link!)}>
                  Copy
                </InlineActionButton>
                <a
                  href={order.tracking_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center rounded-xl border border-white/10 bg-white/[0.04] px-2.5 py-1 text-xs font-medium text-[var(--color-muted)] transition-colors hover:bg-white/[0.08] hover:text-[var(--color-text)]"
                >
                  Open
                </a>
              </div>
            }
          />
        ) : null}

        {typeof order?.id === 'number' ? (
          <div className="rounded-[22px] border border-white/10 bg-white/[0.035] px-4 py-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="space-y-2">
                <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-[var(--color-muted)]">
                  Client Form
                </p>
                <ClientFormLinkStatus
                  clientFormSubmittedAt={order.client_form_submitted_at}
                  tokenHash={order.client_form_token_hash}
                />
                {!order.client_form_submitted_at && !order.client_form_token_hash ? (
                  <p className="text-[0.88rem] text-[var(--color-muted)]">
                    No client form link has been generated yet.
                  </p>
                ) : null}
              </div>
              <ClientFormLinkButton orderId={order.id} />
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}

const TrackingRow = ({ label, value, actions }: TrackingRowProps) => {
  return (
    <div className="flex items-start justify-between gap-3 rounded-[18px] border border-white/8 bg-white/[0.035] px-4 py-3">
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-[var(--color-muted)]">
          {label}
        </p>
        <div className="mt-2 min-w-0">{value}</div>
      </div>
      {actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
    </div>
  )
}

const InlineActionButton = ({ children, onClick }: InlineActionButtonProps) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center rounded-xl border border-white/10 bg-white/[0.04] px-2.5 py-1 text-xs font-medium text-[var(--color-muted)] transition-colors hover:bg-white/[0.08] hover:text-[var(--color-text)]"
    >
      {children}
    </button>
  )
}
