import { formatPhone } from '@/shared/data-validation/phoneValidation'
import { StateCard } from '@/shared/layout/StateCard'
import { useEffect, useState } from 'react'

import type { Order } from '../types/order'
import type { OrderState } from '../types/orderState'
import { AccordionSection } from '@/shared/layout/AccordionSection'
import type { PropsWithChildren } from 'react'
import { formatIsoDate } from '@/shared/utils/formatIsoDate'
import { ClientFormLinkButton } from './clientFormLink/ClientFormLinkButton'
import { ClientFormLinkStatus } from './clientFormLink/ClientFormLinkStatus'

type OrderDetailSummaryProps = {
  order: Order | null
  orderState: OrderState | null
}

type SummarySectionKey = 'details' | 'client' | 'dates'
const ORDER_DETAIL_LAST_OPEN_SECTION_STORAGE_KEY = 'orderDetail.lastOpenSection'
const isBrowser = typeof window !== 'undefined'

const isSummarySectionKey = (value: string): value is SummarySectionKey =>
  value === 'details' || value === 'client' || value === 'dates'

const persistLastOpenSection = (section: SummarySectionKey) => {
  if (!isBrowser) return
  try {
    window.localStorage.setItem(ORDER_DETAIL_LAST_OPEN_SECTION_STORAGE_KEY, section)
  } catch {
    // Ignore storage failures to keep detail rendering stable.
  }
}

const getLastOpenSection = (): SummarySectionKey | null => {
  if (!isBrowser) return null
  try {
    const storedSection = window.localStorage.getItem(ORDER_DETAIL_LAST_OPEN_SECTION_STORAGE_KEY)
    if (!storedSection) return null
    return isSummarySectionKey(storedSection) ? storedSection : null
  } catch {
    return null
  }
}

const asText = (value?: string | null) => value || '—'

export const OrderDetailSummary = ({ order, orderState }: OrderDetailSummaryProps) => {
  const [openSection, setOpenSection] = useState<SummarySectionKey | null>(null)

  const toggleSection = (section: SummarySectionKey) => {
    setOpenSection((current) => {
      const nextSection = current === section ? null : section
      if (nextSection) {
        persistLastOpenSection(nextSection)
      }
      return nextSection
    })
  }

  useEffect(() => {
    const lastSection = getLastOpenSection()
    if (!lastSection) return
    setOpenSection(lastSection)
  }, [])

  return (
    <>
      <div className="border-1 rounded-lg border-[var(--color-muted)]/40  px-4 py-4 min-h-[300px] ">
          <SummaryCard>
            <>
              <div className="grid grid-cols-2 gap-3 text-sm ">
                <div>
                  <p className="text-xs text-[var(--color-muted)]">Customer</p>
                  <p className="text-wrap">{`${asText(order?.client_first_name)} ${asText(order?.client_last_name)}`.trim()}</p>
                </div>
                <div>
                  <p className="text-xs text-[var(--color-muted)] ">Email</p>
                    {order?.client_email ? (
                      <a
                        href={`mailto:${order.client_email}`}
                        className="break-all"
                      >
                        {order.client_email}
                      </a>
                    ) : (
                      <p>—</p>
                    )}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-xs text-[var(--color-muted)]">Phone</p>
                  {order?.client_primary_phone ? (
                    <a
                      href={`tel:${order.client_primary_phone}`}
                      className="underline text-blue-800"
                    >
                      {formatPhone(order.client_primary_phone)}
                    </a>
                  ) : (
                    <p>—</p>
                  )}
                </div>
                <div>
                  <p className="text-xs text-[var(--color-muted)]">Second Phone</p>
                  {order?.client_secondary_phone ? (
                    <a
                      href={`tel:${order.client_secondary_phone}`}
                      className="underline text-blue-800"
                    >
                      {formatPhone(order.client_secondary_phone)}
                    </a>
                  ) : (
                    <p>—</p>
                  )}
                </div>
              </div>
              <div className="text-sm">
                <p className="text-xs text-[var(--color-muted)]">Address</p>
                  {order?.client_address?.street_address ? (
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                        order.client_address.street_address
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-wrap"
                    >
                      {order.client_address.street_address}
                    </a>
                  ) : (
                    <p>—</p>
                  )}
              </div>

              {/* ── Order notes ── */}
              {order?.order_notes && order.order_notes.length > 0 && (
                <div className="space-y-1">
                  {order.order_notes.map((note, i) => (
                    <div
                      key={i}
                      className="rounded-lg border border-yellow-400 bg-yellow-50 px-3 py-2 text-sm text-yellow-700"
                    >
                      {note}
                    </div>
                  ))}
                </div>
              )}

              {/* ── Tracking info (system-managed, read-only) ── */}
              <div className="space-y-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-ligth-bg)] px-3 py-2 text-sm">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="text-xs text-[var(--color-muted)]">Tracking number</p>
                    <p className="font-mono text-sm">{asText(order?.tracking_number)}</p>
                  </div>
                  {order?.tracking_number && (
                    <button
                      type="button"
                      title="Copy tracking number"
                      onClick={() => navigator.clipboard.writeText(order.tracking_number!)}
                      className="shrink-0 rounded p-1 text-xs text-[var(--color-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-ligth-bg)] transition-colors"
                    >
                      Copy
                    </button>
                  )}
                </div>
                {order?.tracking_link && (
                  <div className="flex items-center justify-between gap-2 border-t border-[var(--color-border)] pt-2">
                    <div className="min-w-0">
                      <p className="text-xs text-[var(--color-muted)]">Tracking link</p>
                      <a
                        href={order.tracking_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block truncate text-xs text-[var(--color-primary)] hover:underline"
                      >
                        {order.tracking_link}
                      </a>
                    </div>
                    <div className="flex shrink-0 gap-1">
                      <button
                        type="button"
                        title="Copy tracking link"
                        onClick={() => navigator.clipboard.writeText(order.tracking_link!)}
                        className="rounded p-1 text-xs text-[var(--color-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-ligth-bg)] transition-colors"
                      >
                        Copy
                      </button>
                      <a
                        href={order.tracking_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded p-1 text-xs text-[var(--color-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-ligth-bg)] transition-colors"
                      >
                        Open
                      </a>
                    </div>
                  </div>
                )}
              </div>

              {/* ── Client form link section ── */}
              {typeof order?.id === 'number' && (
                <div className="space-y-2 border-t border-[var(--color-border)] pt-3">
                  <ClientFormLinkStatus
                    clientFormSubmittedAt={order.client_form_submitted_at}
                    tokenHash={order.client_form_token_hash}
                  />
                  <ClientFormLinkButton orderId={order.id} />
                </div>
              )}
            </>
          </SummaryCard>

      </div>
         
    </>
  )
}

const SummaryCard = ({children}:PropsWithChildren)=>{
  return (
    <div className="flex flex-col gap-4 p-1">
      {children}
    </div>
  )
}
