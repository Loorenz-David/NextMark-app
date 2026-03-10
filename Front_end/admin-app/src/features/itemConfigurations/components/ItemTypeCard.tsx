import { useState } from 'react'

import type { ItemType } from '../types/itemType'

type ItemTypeCardProps = {
  item: ItemType
  onEdit: (clientId: string) => void
}

export const ItemTypeCard = ({ item, onEdit }: ItemTypeCardProps) => {
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
          Properties: {item.properties?.length ?? 0}
        </div>
      ) : null}
    </div>
  )
}
