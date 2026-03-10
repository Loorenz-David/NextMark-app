import { useMemo } from 'react'

import { CloseIcon } from '@/assets/icons'
import { cn } from '@/lib/utils/cn'

type ActiveFilterEntry =
  | {
      type: 'single'
      parentKey: string
      itemKey: string
      value: unknown
    }
  | {
      type: 'array'
      parentKey: string
      itemKey: string
      value: unknown
    }

type ActiveFilterPillsProps = {
  filters: Record<string, unknown>
  removeFilter: (key: string) => void
  formatFilterLabel?: (key: string, value: unknown) => string
  className?: string
}

const formatFallbackLabel = (key: string, value: unknown): string => {
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return `${key}: ${String(value)}`
  }

  if (Array.isArray(value)) {
    return `${key}: ${value.map((item) => String(item)).join(', ')}`
  }

  return `${key}: ${String(value)}`
}

export const ActiveFilterPills = ({
  filters,
  removeFilter,
  formatFilterLabel,
  className,
}: ActiveFilterPillsProps) => {

  const activeEntries = useMemo<ActiveFilterEntry[]>(() => {
    return Object.entries(filters)
      .filter(([, value]) => value !== null && value !== undefined && value !== '')
      .flatMap((entry): ActiveFilterEntry[] => {
        const [key, value] = entry
        if (Array.isArray(value)) {
          return value.map((item) => ({
            type: 'array' as const,
            parentKey: key,
            itemKey: String(item),
            value: item,
          }))
        }

        return [
          {
            type: 'single' as const,
            parentKey: key,
            itemKey: key,
            value,
          },
        ]
      })
  }, [filters])

  if (!activeEntries.length) return null

  const renderPillLabel = (key: string, value: unknown) =>
    formatFilterLabel ? formatFilterLabel(key, value) : formatFallbackLabel(key, value)

  return (
    <div className={cn('flex flex-nowrap items-center gap-2 overflow-x-auto pb-3', className)}>
      {activeEntries.map((entry) => {
        const { type, parentKey, itemKey, value } = entry

        return (
          <div
            key={`${parentKey}-${itemKey}`}
            className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700"
          >
            <span className="whitespace-nowrap">
              {type === 'array'
                ? renderPillLabel(itemKey, value)
                : renderPillLabel(parentKey, value)}
            </span>

            <button
              type="button"
              aria-label={`Remove ${itemKey} filter`}
              onClick={() =>
                type === 'array'
                  ? removeFilter(itemKey)
                  : removeFilter(parentKey)
              }
              className="inline-flex items-center justify-center rounded-full p-0.5 text-blue-600 transition-colors hover:bg-blue-100 hover:text-blue-700"
            >
              <CloseIcon className="h-3 w-3" />
            </button>
          </div>
        )
      })}
    </div>
  )
}
