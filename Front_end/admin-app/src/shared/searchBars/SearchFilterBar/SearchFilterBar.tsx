import { useEffect, useMemo, useState, type ChangeEvent } from 'react'
import type { Dayjs } from 'dayjs'
import dayjs from 'dayjs'
import { DatePicker } from '@mui/x-date-pickers'

import { FilteredIcon } from '@/assets/icons'
import { BasicButton } from '@/shared/buttons/BasicButton'
import { InputField } from '@/shared/inputs/InputField'
import { FloatingPopover } from '@/shared/popups/FloatingPopover/FloatingPopover'

import type { FilterConfig, SearchFilterBarProps } from './SearchFilterBar.types'

const EMPTY_RANGE: [Dayjs | null, Dayjs | null] = [null, null]

const parseDateFilterValue = (value: unknown): Dayjs | null => {
  if (typeof value !== 'string' || !value.trim()) return null
  const parsed = dayjs(value)
  return parsed.isValid() ? parsed : null
}

const isDateRangeFilter = (filter: FilterConfig): filter is Extract<FilterConfig, { type: 'date-range' }> =>
  filter.type === 'date-range'

export const SearchFilterBar = ({
  applySearch,
  updateFilter,
  filters = {},
  config = [],
  hideFilteredIcon = false,
  placeholder,
}: SearchFilterBarProps) => {
  const [open, setOpen] = useState(false)
  const [searchInput, setSearchInput] = useState('')
  const [tempRange, setTempRange] = useState<[Dayjs | null, Dayjs | null]>(EMPTY_RANGE)

  const dateRangeFilter = useMemo(
    () => config.find(isDateRangeFilter) ?? null,
    [config],
  )

  useEffect(() => {
    if (!open || !dateRangeFilter) return

    const start = parseDateFilterValue(filters[dateRangeFilter.keyStart])
    const end = parseDateFilterValue(filters[dateRangeFilter.keyEnd])
    setTempRange([start, end])
  }, [dateRangeFilter, filters, open])

  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value
    setSearchInput(value)
    applySearch(value)
  }

  const applyDateRange = (filter: Extract<FilterConfig, { type: 'date-range' }>) => {
    if (!updateFilter) return

    const [start, end] = tempRange

    if (start) {
      updateFilter(filter.keyStart, start.format('YYYY-MM-DD'))
    }

    if (end) {
      updateFilter(filter.keyEnd, end.format('YYYY-MM-DD'))
    }

    setOpen(false)
  }

  const isOptionSelected = (filter: Extract<FilterConfig, { type: 'option' }>) => {
    if (filters[filter.key] === filter.value) return true

    return Object.values(filters).some((filterValue) => {
      if (!Array.isArray(filterValue)) return false
      return filterValue.some((item) => item === filter.key || item === filter.value)
    })
  }

  return (
    <div className="flex w-full flex-col gap-2">
      <FloatingPopover
        open={open}
        onOpenChange={setOpen}
        matchReferenceWidth
        closeOnInsideClick
        reference={(
          <div className="flex w-full items-center gap-2 rounded-full border-1 border-[var(--color-muted)]/40 bg-[var(--color-muted)]/10  py-1 pl-4 ">
            <div className="flex-1">
              <InputField
                value={searchInput}
                onChange={handleSearchChange}
                placeholder={placeholder ?? 'Search...'}
                fieldClassName=""
                inputClassName="text-xs w-full"

              />
            </div>
            {!hideFilteredIcon ? (
              <BasicButton
                params={{
                  variant: 'ghost',
                  ariaLabel: 'Open filters',
                  onClick: () => setOpen(prev => !prev),
                  className: 'pr-3',
                }}
              >
                <FilteredIcon className="h-4 w-4" />
              </BasicButton>
            ) : null}
          </div>
        )}
      >
        <div className="flex max-h-[320px] flex-col gap-2 overflow-y-auto scroll-thin rounded-xl border border-[var(--color-border)] bg-[var(--color-page)] p-2 shadow-md">
          {config.length === 0 ? (
            <div className="px-2 py-1 text-xs text-[var(--color-muted)]">
              No filters configured.
            </div>
          ) : null}

          {config.map((filter, index) => {
            if (filter.type === 'option') {
              const selected = isOptionSelected(filter)
              return (
                <button
                  key={`${filter.type}-${filter.key}-${String(filter.value)}-${index}`}
                  type="button"
                  data-popover-close="true"
                  onClick={() => updateFilter?.(filter.key, filter.value)}
                  className="flex w-full items-center justify-between rounded-md px-2 py-2 text-left text-sm transition-colors hover:bg-[var(--color-muted)]/10"
                >
                  <span>{filter.label}</span>
                  {selected ? (
                    <span className="rounded-full bg-[var(--color-muted)]/20 px-2 py-0.5 text-[10px] text-[var(--color-muted)]">
                      Selected
                    </span>
                  ) : null}
                </button>
              )
            }

            const [start, end] = tempRange
            return (
              <div
                key={`${filter.type}-${filter.keyStart}-${filter.keyEnd}-${index}`}
                className="flex flex-col gap-2 rounded-md border border-[var(--color-border)] p-2"
              >
                <span className="text-xs font-semibold text-[var(--color-muted)]">
                  {filter.label}
                </span>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <DatePicker
                    label="Start"
                    value={start}
                    onChange={(value) => setTempRange([value, end])}
                    slotProps={{ textField: { size: 'small' } }}
                  />
                  <DatePicker
                    label="End"
                    value={end}
                    onChange={(value) => setTempRange([start, value])}
                    slotProps={{ textField: { size: 'small' } }}
                  />
                </div>
                <div className="flex items-center justify-end gap-2">
                  <BasicButton
                    params={{
                      variant: 'text',
                      onClick: () => setTempRange(EMPTY_RANGE),
                      ariaLabel: 'Clear date range',
                    }}
                  >
                    Clear
                  </BasicButton>
                  <BasicButton
                    params={{
                      variant: 'secondary',
                      onClick: () => applyDateRange(filter),
                      ariaLabel: 'Apply date range filter',
                    }}
                  >
                    Apply
                  </BasicButton>
                </div>
              </div>
            )
          })}
        </div>
      </FloatingPopover>
    </div>
  )
}
