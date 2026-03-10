import { useMemo, useState } from 'react'

import type { Warehouse } from '../types/warehouse'

type WarehouseCardProps = {
  warehouse: Warehouse
  onEdit: (clientId: string) => void
}

const buildLocationSummary = (location: Record<string, unknown> | null | undefined) => {
  if (!location) return 'No address'
  const { street_address, city, country, postal_code } = location as {
    street_address?: string
    city?: string
    country?: string
    postal_code?: string
  }

  const primary = street_address || [postal_code, city].filter(Boolean).join(' ')
  const secondary = [city, country].filter(Boolean).join(', ')

  if (primary && secondary) return `${primary} · ${secondary}`
  return primary || secondary || 'No address'
}

export const WarehouseCard = ({ warehouse, onEdit }: WarehouseCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const locationSummary = useMemo(
    () => buildLocationSummary(warehouse.property_location ?? null),
    [warehouse.property_location],
  )

  return (
    <div className="rounded-lg border border-[var(--color-border)] bg-white px-4 py-3">
      <button
        type="button"
        onClick={() => setIsExpanded((prev) => !prev)}
        className="flex w-full items-center justify-between text-left"
      >
        <div>
          <p className="text-sm font-semibold text-[var(--color-text)]">{warehouse.name}</p>
          <p className="text-xs text-[var(--color-muted)]">{locationSummary}</p>
        </div>
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation()
            onEdit(warehouse.client_id)
          }}
          className="text-xs text-[var(--color-muted)] hover:text-[var(--color-text)]"
        >
          Edit
        </button>
      </button>
      {isExpanded ? (
        <div className="mt-3 text-xs text-[var(--color-muted)]">
          {locationSummary}
        </div>
      ) : null}
    </div>
  )
}
