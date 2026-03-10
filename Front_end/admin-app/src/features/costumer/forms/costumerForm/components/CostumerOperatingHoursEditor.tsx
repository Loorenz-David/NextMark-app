import { useMemo } from 'react'
import { CheckMarkIcon } from '@/assets/icons'
import { CustomTimePicker } from '@/shared/inputs/CustomTimePicker'
import { Switch } from '@/shared/inputs/Switch'

import type { CostumerOperatingHours } from '../../../dto/costumer.dto'
import type { CostumerFormLayoutModel } from '../CostumerForm.layout.model'
import { WEEKDAY_OPTIONS } from '../flows/costumerOperatingHours.flow'

type CostumerOperatingHoursEditorProps = {
  model: CostumerFormLayoutModel
}

export const CostumerOperatingHoursEditor = ({ model }: CostumerOperatingHoursEditorProps) => {
  const entriesByWeekday = useMemo(() => {
    const byWeekday = new Map<number, (typeof model.formState.operating_hours)[number]>()
    model.formState.operating_hours.forEach((entry) => {
      byWeekday.set(entry.weekday, entry)
    })
    return byWeekday
  }, [model.formState.operating_hours])

  return (
    <div className="flex flex-col divide-y divide-[var(--color-border)] rounded-xl overflow-hidden border border-[var(--color-border)]/70 bg-[var(--color-page)] shadow-sm">
      {WEEKDAY_OPTIONS.map((day) => {
        const entry = entriesByWeekday.get(day.weekday)
        const isSelected = Boolean(entry)

        return (
          <OperatingDayRow
            key={day.weekday}
            day={day}
            entry={entry}
            isSelected={isSelected}
            model={model}
          />
        )
      })}
    </div>
  )
}

type OperatingDayRowProps = {
  day: (typeof WEEKDAY_OPTIONS)[number]
  entry: CostumerOperatingHours | undefined
  isSelected: boolean
  model: CostumerFormLayoutModel
}

const OperatingDayRow = ({
  day,
  entry,
  isSelected,
  model,
}: OperatingDayRowProps) => {
  const toggleDaySelection = () => {
    if (isSelected) {
      model.formSetters.removeOperatingDay(day.weekday)
      return
    }
    model.formSetters.toggleOperatingDay(day.weekday)
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={toggleDaySelection}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          toggleDaySelection()
        }
      }}
      className={`grid grid-cols-1 items-center gap-3 px-4 py-3 md:grid-cols-[140px_1fr_auto] ${
        isSelected ? 'bg-[var(--color-light-blue)]/10' : 'bg-transparent'
      }`}
    >
      <div className="flex items-center gap-3">
        <span className="flex h-4 w-4 items-center justify-center rounded-full border border-blue-200 bg-blue-50">
          {isSelected ? <CheckMarkIcon className="h-4 w-4 text-blue-600" /> : null}
        </span>
        <span className="text-sm font-medium text-[var(--color-text)]">{day.longLabel}</span>
      </div>

      <div className="min-h-[38px] flex items-center" >
        {isSelected && !entry?.is_closed ? (
          <div className="flex items-center gap-3 " onClick={(event) => event.stopPropagation()}>
            <CustomTimePicker
              className="px-2 py-1 border-1 border-[var(--color-border-accent)] bg-white max-w-[100px]"
              selectedTime={entry?.open_time ?? null}
              onChange={(value) => model.formSetters.setOperatingDayOpenTime(day.weekday, value)}
            />
            <span className="text-xs text-[var(--color-muted)]">-</span>
            <CustomTimePicker
              selectedTime={entry?.close_time ?? null}
              className="px-2 py-1 border-1 border-[var(--color-border-accent)] bg-white max-w-[100px]"
              onChange={(value) => model.formSetters.setOperatingDayCloseTime(day.weekday, value)}
            />
          </div>
        ) : isSelected ? (
          <div className="flex min-h-[38px] items-center">
            <span className="text-xs italic text-[var(--color-muted)]">Marked as closed</span>
          </div>
        ) : null}
      </div>

      <div className="flex justify-end" >
        {isSelected ? (
          <div className="flex items-center gap-2" onClick={(event) => event.stopPropagation()}>
            <span className="text-xs text-[var(--color-muted)]">Closed</span>
            <Switch
              value={Boolean(entry?.is_closed)}
              onChange={(value) => model.formSetters.setOperatingDayClosed(day.weekday, value)}
              sizeClassName="h-7 w-12"
              ariaLabel={`Toggle ${day.longLabel} closed`}
            />
          </div>
        ) : null}
      </div>
    </div>
  )
}
