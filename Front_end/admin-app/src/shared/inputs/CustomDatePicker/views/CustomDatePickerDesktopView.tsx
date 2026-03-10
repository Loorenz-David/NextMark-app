import type { KeyboardEvent, RefObject } from 'react'

import { FloatingPopover } from '@/shared/popups/FloatingPopover/FloatingPopover'

import { CustomDatePickerCalendarPanel } from '../components/CustomDatePickerCalendarPanel'
import { CustomDatePickerInput } from '../components/CustomDatePickerInput'

type CustomDatePickerDesktopViewProps = {
  inputValue: string
  showTodayLabel: boolean
  committedDate: Date | null
  isOpen: boolean
  visibleMonth: Date
  disabled?: boolean
  className?: string
  renderPopoverInPortal?: boolean
  minDate?: Date
  maxDate?: Date
  inputRef: RefObject<HTMLInputElement | null>
  onOpen: () => void
  onClose: () => void
  onInputBlur: () => void
  onInputChange: (value: string) => void
  onInputKeyDown: (event: KeyboardEvent<HTMLInputElement>) => void
  onCalendarSelect: (date: Date) => void
  onVisibleMonthChange: (month: Date) => void
}

export const CustomDatePickerDesktopView = ({
  inputValue,
  showTodayLabel,
  committedDate,
  isOpen,
  visibleMonth,
  disabled,
  className,
  renderPopoverInPortal,
  minDate,
  maxDate,
  inputRef,
  onOpen,
  onClose,
  onInputBlur,
  onInputChange,
  onInputKeyDown,
  onCalendarSelect,
  onVisibleMonthChange,
}: CustomDatePickerDesktopViewProps) => {
  return (
    <FloatingPopover
      open={isOpen}
      onOpenChange={(nextOpen) => {
        if (nextOpen) {
          onOpen()
          return
        }

        onClose()
      }}
      classes='relative'
      renderInPortal={renderPopoverInPortal}
      reference={
        <CustomDatePickerInput
          value={inputValue}
          showTodayLabel={showTodayLabel}
          disabled={disabled}
          className={className}
          onOpen={onOpen}
          onBlur={onInputBlur}
          onKeyDown={onInputKeyDown}
          onChange={onInputChange}
          inputRef={inputRef}
        />
      }
    >
      <CustomDatePickerCalendarPanel
        isOpen={isOpen}
        value={committedDate}
        visibleMonth={visibleMonth}
        minDate={minDate}
        maxDate={maxDate}
        onVisibleMonthChange={onVisibleMonthChange}
        onSelect={onCalendarSelect}
        onRequestClose={onClose}
      />
    </FloatingPopover>
  )
}
