import { useEffect, useMemo, useRef } from 'react'
import { motion } from 'framer-motion'

import { BackArrowIcon2 } from '@/assets/icons'
import {
  CalendarDayCell,
  CalendarRoot,
  addDays,
  getCalendarDayKey,
  useCalendarModel,
} from '@/shared/calendar'

import { isDateWithinRange, normalizeToDay } from '../model/customDatePicker.utils'

type CustomDatePickerCalendarPanelProps = {
  isOpen: boolean
  value: Date | null
  visibleMonth: Date
  minDate?: Date
  maxDate?: Date
  onVisibleMonthChange: (month: Date) => void
  onSelect: (date: Date) => void
  onRequestClose: () => void
}

const WEEKDAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

export const CustomDatePickerCalendarPanel = ({
  isOpen,
  value,
  visibleMonth,
  minDate,
  maxDate,
  onVisibleMonthChange,
  onSelect,
  onRequestClose,
}: CustomDatePickerCalendarPanelProps) => {
  const panelRef = useRef<HTMLDivElement | null>(null)
  const today = useMemo(() => normalizeToDay(new Date()), [])

  const normalizedValue = useMemo(() => (value ? normalizeToDay(value) : null), [value])
  const isTodaySelected = useMemo(
    () => Boolean(normalizedValue && normalizedValue.getTime() === today.getTime()),
    [normalizedValue, today],
  )
  const isTodayDisabled = useMemo(
    () =>
      !isDateWithinRange({
        date: today,
        minDate,
        maxDate,
      }),
    [maxDate, minDate, today],
  )

  const model = useCalendarModel({
    selectionMode: 'single',
    value: normalizedValue,
    visibleMonth,
    onVisibleMonthChange,
  })

  useEffect(() => {
    if (!isOpen || !panelRef.current) return

    const focusTarget =
      panelRef.current.querySelector<HTMLElement>("[data-selected='true']") ||
      panelRef.current.querySelector<HTMLElement>("[aria-current='date']") ||
      panelRef.current.querySelector<HTMLElement>('[data-day-key]')

    focusTarget?.focus()
  }, [isOpen, visibleMonth, model.daysMatrix])

  return (
    <motion.div
      ref={panelRef}
      className='admin-glass-popover w-[310px] overflow-hidden rounded-lg border border-[var(--color-border-accent)] p-3 text-sm shadow-md'
      initial={{ height: 0, opacity: 0, y: -4 }}
      animate={{ height: 'auto', opacity: 1, y: 0 }}
      exit={{ height: 0, opacity: 0, y: -4 }}
      transition={{ duration: 0.15, ease: 'easeOut' }}
      onKeyDown={(event) => {
        if (event.key === 'Escape') {
          event.preventDefault()
          onRequestClose()
        }
      }}
    >
      <CalendarRoot
        model={model}
        renderHeader={(calendarModel) => {
          const monthLabel = calendarModel.visibleMonth.toLocaleDateString(undefined, {
            month: 'long',
            year: 'numeric',
          })

          return (
            <div className='mb-2'>
              <div className='mb-2 flex items-center justify-between gap-2'>
                <button
                  type='button'
                  className='rounded-md p-1 hover:bg-white/[0.08]'
                  onClick={calendarModel.prevMonth}
                  aria-label='Previous month'
                >
                  <BackArrowIcon2 className='h-4 w-4 text-[var(--color-text)]' />
                </button>

                <div className='text-sm font-semibold text-[var(--color-text)]'>{monthLabel}</div>

                <button
                  type='button'
                  className='rounded-md p-1 hover:bg-white/[0.08]'
                  onClick={calendarModel.nextMonth}
                  aria-label='Next month'
                >
                  <BackArrowIcon2 className='h-4 w-4 rotate-180 text-[var(--color-text)]' />
                </button>
              </div>
              <div className='grid grid-cols-7 gap-0.5 text-center text-[10px] uppercase tracking-wide text-[var(--color-muted)]/80'>
                {WEEKDAY_LABELS.map((label) => (
                  <span key={label}>{label}</span>
                ))}
              </div>
            </div>
          )
        }}
        renderDay={({ day, date, isSelected, tabIndex, ariaLabel, isToday }) => {
          const normalizedDate = normalizeToDay(date)
          const isDisabled = !isDateWithinRange({
            date: normalizedDate,
            minDate,
            maxDate,
          })

          return (
            <CalendarDayCell
              day={day}
              isSelected={isSelected}
              isInRange={false}
              onSelect={() => {
                if (isDisabled) return
                onSelect(normalizedDate)
              }}
              tabIndex={tabIndex}
              ariaLabel={ariaLabel}
              isToday={isToday}
              onKeyDown={(event) => {
                if (event.key === 'Escape') {
                  event.preventDefault()
                  onRequestClose()
                  return
                }

                const stepByKey: Record<string, number> = {
                  ArrowLeft: -1,
                  ArrowRight: 1,
                  ArrowUp: -7,
                  ArrowDown: 7,
                }

                const step = stepByKey[event.key]
                if (!step) return

                event.preventDefault()

                const nextDay = addDays(normalizedDate, step)
                const nextKey = getCalendarDayKey(nextDay)
                const nextNode = panelRef.current?.querySelector<HTMLElement>(
                  `[data-day-key='${nextKey}']`,
                )

                nextNode?.focus()
              }}
              className={[
                'h-9 w-9 rounded-md text-xs font-medium transition-colors',
                day.isCurrentMonth ? 'text-[var(--color-text)]' : 'text-[var(--color-muted)]/50',
                isToday && !isSelected ? 'bg-blue-500/10 text-blue-600' : '',
                isSelected ? 'bg-[var(--color-text)] text-white' : '',
                !isSelected && !isDisabled ? 'hover:bg-white/[0.08]' : '',
                isDisabled ? 'cursor-not-allowed opacity-35' : '',
              ].join(' ')}
            >
              {date.getDate()}
            </CalendarDayCell>
          )
        }}
      />

      {!isTodaySelected ? (
          <div className='mt-2 border-t border-white/[0.08] pt-2'>
          <button
            type='button'
            className='w-full rounded-md py-1.5 text-xs font-semibold text-blue-600 hover:bg-blue-500/10 disabled:cursor-not-allowed disabled:text-[var(--color-muted)]/70 disabled:hover:bg-transparent'
            onClick={() => {
              if (isTodayDisabled) return
              onSelect(today)
            }}
            disabled={isTodayDisabled}
          >
            Today
          </button>
        </div>
      ) : null}
    </motion.div>
  )
}
