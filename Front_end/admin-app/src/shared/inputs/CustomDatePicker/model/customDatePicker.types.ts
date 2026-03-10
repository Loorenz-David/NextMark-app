import type { KeyboardEvent } from 'react'

export type CustomDatePickerProps = {
  date?: Date | null
  onChange?: (value: string | null) => void
  disabled?: boolean
  disablePast?: boolean
  minDate?: Date
  maxDate?: Date
  className?: string
  renderPopoverInPortal?: boolean
  open?: boolean
  onOpenChange?: (isOpen: boolean) => void
  onCalendarSelect?: (date: Date) => void
}

export type UseCustomDatePickerControllerInput = CustomDatePickerProps

export type CustomDatePickerController = {
  inputValue: string
  committedDate: Date | null
  isOpen: boolean
  visibleMonth: Date

  openPopover: () => void
  closePopover: () => void

  handleInputChange: (value: string) => void
  handleInputBlur: () => void
  handleInputKeyDown: (event: KeyboardEvent<HTMLInputElement>) => void

  handleCalendarSelect: (date: Date) => void
  handleVisibleMonthChange: (month: Date) => void
}
