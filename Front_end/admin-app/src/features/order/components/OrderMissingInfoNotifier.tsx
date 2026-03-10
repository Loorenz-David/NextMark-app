import { useMemo, useState } from 'react'

import { ExclamationIcon, TriangleWarningIcon } from '@/assets/icons'
import { useOrderValidation } from '@/features/order/domain/useOrderValidation'
import { useOrderActions } from '@/features/order'
import type { Order } from '@/features/order/types/order'
import { FloatingPopover } from '@/shared/popups/FloatingPopover/FloatingPopover'

type OrderMissingInfoNotifierProps = {
  order: Order
}

const getMissingFieldLabels = (
  order: Order,
  validators: ReturnType<typeof useOrderValidation>,
): string[] => {
  const missingFields: string[] = []

  if (!validators.validateReferenceNumber(order.reference_number ?? '')) {
    missingFields.push('Reference number')
  }

  if (!validators.validateCustomerName(order.client_first_name ?? '')) {
    missingFields.push('Client first name')
  }

  if (!validators.validateCustomerName(order.client_last_name ?? '')) {
    missingFields.push('Client last name')
  }

  if (!validators.validateCustomerEmail(order.client_email ?? null)) {
    missingFields.push('Client email')
  }

  if (!validators.validatePhone(order.client_primary_phone ?? null, { required: true })) {
    missingFields.push('Client primary phone')
  }

  if (!validators.validateAddressValue(order.client_address ?? null)) {
    missingFields.push('Client address')
  }

  return missingFields
}

export const OrderMissingInfoNotifier = ({ order }: OrderMissingInfoNotifierProps) => {
  const validators = useOrderValidation()
  const { openOrderForm } = useOrderActions()
  const [isPopoverOpen, setIsPopoverOpen] = useState(false)

  const missingFields = useMemo(
    () => getMissingFieldLabels(order, validators),
    [order, validators],
  )

  if (!missingFields.length || order.archive_at) {
    return null
  }

 

  return (
    <FloatingPopover
      open={isPopoverOpen}
      onOpenChange={setIsPopoverOpen}
      offSetNum={8}
      crossOffSetNum={-4}
      classes={`absolute -left-2 -top-3 ${isPopoverOpen ? 'z-2' : 'z-1'}`}
      reference={
        <button
          type="button"
          className="flex h-8 w-8 items-center justify-center rounded-full border border-yellow-500/60 bg-yellow-300 shadow-sm"
          aria-label="Order has missing information"
          onMouseEnter={() => setIsPopoverOpen(true)}
          onMouseLeave={() => setIsPopoverOpen(false)}
          onClick={(event) => {
            event.stopPropagation()
            setIsPopoverOpen(false)
            openOrderForm({ clientId: order.client_id, mode: 'edit' })
          }}
        >
          <ExclamationIcon className="h-4 w-4 text-yellow-900" />
        </button>
      }
    >
      <div
        className="w-[240px] rounded-xl border border-[var(--color-border)] bg-white p-3 shadow-xl"
        onMouseEnter={() => setIsPopoverOpen(true)}
        onMouseLeave={() => setIsPopoverOpen(false)}
        onClick={(event) => event.stopPropagation()}
      >
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--color-muted)]">
          Missing information
        </p>
        <ul className="list-disc pl-4 text-xs text-[var(--color-text)]">
          {missingFields.map((field) => (
            <li key={field}>{field}</li>
          ))}
        </ul>
        <p className="mt-2 text-[11px] text-[var(--color-muted)]">
          Click the warning icon to complete this order.
        </p>
      </div>
    </FloatingPopover>
  )
}
