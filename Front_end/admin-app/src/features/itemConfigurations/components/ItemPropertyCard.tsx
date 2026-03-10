import { useState } from 'react'

import type { ItemProperty } from '../types/itemProperty'

type ItemPropertyCardProps = {
  item: ItemProperty
  onEdit: (clientId: string) => void
}

export const ItemPropertyCard = ({ item, onEdit }: ItemPropertyCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <div className="rounded-lg border border-[var(--color-border)] bg-white px-4 py-3">
      <div
        role="button"
        onClick={() => setIsExpanded((prev) => !prev)}
        className="flex w-full items-center justify-between text-left"
      >
        <div>
          <p className="text-sm font-semibold text-[var(--color-text)]">{item.name}</p>
          <p className="text-xs text-[var(--color-muted)]">Type: {item.field_type ?? '—'}</p>
        </div>
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation()
            onEdit(item.client_id)
          }}
          className="text-xs text-[var(--color-muted)] hover:text-[var(--color-text)]"
        >
          Edit
        </button>
      </div>
      {isExpanded ? (
        <div className="mt-3 text-xs text-[var(--color-muted)]">
          Required: {item.required ? 'Yes' : 'No'}
        </div>
      ) : null}
    </div>
  )
}
