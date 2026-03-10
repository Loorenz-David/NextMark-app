import { useState } from 'react'

import type { ItemPosition } from '../types/itemPosition'

type ItemPositionCardProps = {
  item: ItemPosition
  onEdit: (clientId: string) => void
}

export const ItemPositionCard = ({ item, onEdit }: ItemPositionCardProps) => {
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
          <p className="text-xs text-[var(--color-muted)]">
            Default: {item.default ? 'Yes' : 'No'}
          </p>
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
          {item.description ?? 'No description'}
        </div>
      ) : null}
    </div>
  )
}
