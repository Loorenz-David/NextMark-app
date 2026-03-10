import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

import { DeleteIcon, EditIcon } from '@/assets/icons'
import { BasicButton } from '@/shared/buttons/BasicButton'
import { ConfirmActionButton } from '@/shared/buttons/DeleteButton'

import { useItemActions } from '../../hooks/useItemActions'
import { useItemController } from '../../hooks/useItemController'
import type { Item } from '../../types'
import { useItemStateByServerId } from '@/features/itemConfigurations/hooks/useItemSelectors'
import { StateCard } from '@/shared/layout/StateCard'

export type ItemCardProps = {
  item: Item
  onEdit?: () => void
  onDelete?: () => void
  showDelete?: boolean
  isExpanded?: boolean
  onToggleExpand?: () => void
}

export const ItemCard = ({
  item,
  onEdit,
  onDelete,
  showDelete = true,
  isExpanded,
  onToggleExpand,
}: ItemCardProps) => {
  const [internalExpanded, setInternalExpanded] = useState(false)
  const expanded = isExpanded ?? internalExpanded

  const { openEditItem } = useItemActions()
  const { deleteAutonomousItem } = useItemController()

  const dimensions = [item.dimension_width, item.dimension_height, item.dimension_depth]
    .map((value) => (typeof value === 'number' ? value : null))
  const hasDimensions = dimensions.some((value) => value !== null)
  const dimensionsValue = hasDimensions ? `W ${dimensions[0] ?? 0}  x  H ${dimensions[1] ?? 0}  x  D ${dimensions[2] ?? 0}` : '—'
  const propertyEntries = Object.entries(item.properties ?? {})
  const itemState = useItemStateByServerId(item.item_state_id ?? null)
 
  const handleEdit = () => {
    if (onEdit) {
      onEdit()
      return
    }

    if (typeof item.order_id !== 'number') return
    openEditItem(item.order_id, item.client_id)
  }

  const handleDelete = () => {
    if (onDelete) {
      onDelete()
      return
    }

    void deleteAutonomousItem(item.client_id)
  }

  return (
    <div className="rounded-lg border border-[var(--color-muted)]/30 bg-white p-3 px-1 pl-2">
      <button
        type="button"
        className="grid w-full grid-cols-[minmax(0,1.8fr)_minmax(0,1.2fr)_minmax(0,0.8fr)_auto] items-center gap-3 px-1 text-left"
        onClick={() => {
          if (onToggleExpand) {
            onToggleExpand()
            return
          }
          setInternalExpanded((prev) => !prev)
        }}
      >

        <span className="min-w-0 whitespace-normal break-words text-sm font-semibold text-[var(--color-text)]">
          {item.item_type || '—'}
        </span>
        <span className="min-w-0 truncate text-xs text-[var(--color-muted)]">
          {item.article_number || '—'}
        </span>

        <span className="min-w-0 truncate text-xs text-[var(--color-muted)]">
          Qty: {item.quantity}
        </span>

        <div className="shrink-0 justify-self-end">
          <StateCard
            label={itemState ? itemState.name : 'No state'}
            color={itemState ? itemState.color : null}
          />
        </div>


      </button>

      <AnimatePresence initial={false}>
        {expanded ? (
          <motion.div
            key="item-card-expanded"
            initial={{ height: 0, opacity: 0, y: -4 }}
            animate={{ height: 'auto', opacity: 1, y: 0 }}
            exit={{ height: 0, opacity: 0, y: -4 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="overflow-hidden"
          >
        <div className="mt-3 border-t border-[var(--color-border)] pt-3">
          <div className="flex items-center justify-between ">
            
            {showDelete ? (
              <div className="pl-1 ">
                    <ConfirmActionButton
                      onConfirm={handleDelete}
                      deleteContent={<DeleteIcon className="h-4 w-4 text-red-500"/>}
                      confirmContent={'Confirm deletion'}
                      confirmClassName="text-white text-[10px] px-2 py-1 rounded-md bg-red-500"
                    />
              </div>
            ) : null}

            <div className="flex flex-1 justify-end pr-2">
              <BasicButton
                params={{
                  variant: 'rounded',
                  onClick: handleEdit,
                  ariaLabel: 'Edit item',
                  className: 'h-8 w-8',
                }}
              >
                <EditIcon className="h-4 w-4" />
              </BasicButton>
            </div>

          </div>

          <div className="mt-4 flex flex-col gap-2 text-xs px-2 pb-2 pr-4">
            <div className="flex items-start justify-between gap-4">
              <span className="text-[var(--color-muted)]">Item type</span>
              <span className="text-right text-[var(--color-text)]">{item.item_type || '—'}</span>
            </div>
            <div className="flex items-start justify-between gap-4">
              <span className="text-[var(--color-muted)]">Article number</span>
              <span className="text-right text-[var(--color-text)]">{item.article_number || '—'}</span>
            </div>
            <div className="flex items-start justify-between gap-4">
              <span className="text-[var(--color-muted)]">Quantity</span>
              <span className="text-right text-[var(--color-text)]">{item.quantity}</span>
            </div>
            <div className="flex items-start justify-between gap-4">
              <span className="text-[var(--color-muted)]">Reference number</span>
              <span className="text-right text-[var(--color-text)]">{item.reference_number ?? '—'}</span>
            </div>
            <div className="flex items-start justify-between gap-4">
              <span className="text-[var(--color-muted)]">Dimensions (cm) </span>
              <span className="text-right text-[var(--color-text)]">{dimensionsValue} </span>
            </div>
            <div className="flex items-start justify-between gap-4">
              <span className="text-[var(--color-muted)]">Weight (gr)</span>
              <span className="text-right text-[var(--color-text)]">{item.weight ?? '—'}</span>
            </div>

            {propertyEntries.length ? (
              propertyEntries.map(([key, value]) => (
                <div key={key} className="flex items-start justify-between gap-4">
                  <span className="text-[var(--color-muted)]">{key}</span>
                  <span className="text-right text-[var(--color-text)]">{String(value)}</span>
                </div>
              ))
            ) : (
              <div className="flex items-start justify-between gap-4">
                <span className="text-[var(--color-muted)]">Properties</span>
                <span className="text-right text-[var(--color-text)]">—</span>
              </div>
            )}
          </div>
        </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  )
}
