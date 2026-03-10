import { useEffect, useMemo, useRef } from 'react'

import { useCustomDatePickerController } from './model/useCustomDatePickerController'
import {
  formatDateIso,
  isToday,
  resolveEffectiveMinDate,
} from './model/customDatePicker.utils'
import type { CustomDatePickerProps } from './model/customDatePicker.types'
import { CustomDatePickerDesktopView } from './views/CustomDatePickerDesktopView'

export const CustomDatePicker = ({
  date,
  onChange,
  disabled,
  disablePast,
  minDate,
  maxDate,
  className,
  renderPopoverInPortal,
  open,
  onOpenChange,
  onCalendarSelect,
}: CustomDatePickerProps) => {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const effectiveMinDate = useMemo(
    () => resolveEffectiveMinDate({ minDate, disablePast }),
    [disablePast, minDate],
  )

  const controller = useCustomDatePickerController({
    date,
    onChange,
    disabled,
    minDate: effectiveMinDate,
    maxDate,
    open,
    onOpenChange,
    onCalendarSelect,
  })

  const showTodayLabel = useMemo(() => {
    if (!controller.committedDate) return false
    if (!isToday(controller.committedDate)) return false

    return controller.inputValue === formatDateIso(controller.committedDate)
  }, [controller.committedDate, controller.inputValue])

  useEffect(() => {
    if (!controller.isOpen) return

    inputRef.current?.blur()
  }, [controller.isOpen])

  return (
    <CustomDatePickerDesktopView
      inputValue={controller.inputValue}
      showTodayLabel={showTodayLabel}
      committedDate={controller.committedDate}
      isOpen={controller.isOpen}
      visibleMonth={controller.visibleMonth}
      disabled={disabled}
      className={className}
      renderPopoverInPortal={renderPopoverInPortal}
      minDate={effectiveMinDate}
      maxDate={maxDate}
      inputRef={inputRef}
      onOpen={controller.openPopover}
      onClose={controller.closePopover}
      onInputBlur={controller.handleInputBlur}
      onInputChange={controller.handleInputChange}
      onInputKeyDown={controller.handleInputKeyDown}
      onCalendarSelect={(selectedDate) => {
        controller.handleCalendarSelect(selectedDate)

        if (!disabled) {
          requestAnimationFrame(() => {
            inputRef.current?.focus()
          })
        }
      }}
      onVisibleMonthChange={controller.handleVisibleMonthChange}
    />
  )
}
