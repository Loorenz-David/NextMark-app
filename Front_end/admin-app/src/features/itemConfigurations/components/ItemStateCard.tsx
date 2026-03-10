import type { ItemState } from '../types/itemState'

type ItemStateCardProps = {
  item: ItemState
  onEdit: (clientId: string) => void
}

export const ItemStateCard = ({ item, onEdit }: ItemStateCardProps) => {
  return (
    <div className="w-80 rounded-lg border border-[var(--color-border)] bg-white px-4 py-3">
      <div
        className="flex w-full items-center justify-between text-left"
      >
        <div className="flex items-start gap-3">
          <span
            className="mt-0.5 h-4 w-4 shrink-0 rounded-md border border-[var(--color-border)]"
            style={{ backgroundColor: item.color || 'transparent' }}
          />
          <div>
            <p className="text-sm font-semibold text-[var(--color-text)]">{item.name}</p>
            <p className="text-xs text-[var(--color-muted)]">{item.description ?? 'No description'}</p>
          </div>
        </div>
        {item.is_system ? null : (
          <button
            type="button"
            onPointerDown={(event) => event.stopPropagation()}
            onClick={(event) => {
              event.stopPropagation()
              onEdit(item.client_id)
            }}
            className="text-xs text-[var(--color-muted)] hover:text-[var(--color-text)]"
          >
            Edit
          </button>
        )}
      </div>
      
    </div>
  )
}
