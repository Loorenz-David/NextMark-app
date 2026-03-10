import { useCallback, useEffect, useMemo, useState } from 'react'
import type { KeyboardEvent } from 'react'

import type {
  CustomDatePickerController,
  UseCustomDatePickerControllerInput,
} from './customDatePicker.types'
import {
  formatCommittedInput,
  formatDateIso,
  isDateWithinRange,
  isSameDay,
  isValidDate,
  parseIsoDate,
  resolveVisibleMonthAnchor,
} from './customDatePicker.utils'

const resolveExternalDate = (value: Date | null | undefined): Date | null => {
  if (!isValidDate(value)) return null
  return value
}

export const useCustomDatePickerController = ({
  date,
  onChange,
  disabled,
  minDate,
  maxDate,
  open,
  onOpenChange,
  onCalendarSelect,
}: UseCustomDatePickerControllerInput): CustomDatePickerController => {
  const externalDate = useMemo(() => resolveExternalDate(date), [date])

  const [committedDate, setCommittedDate] = useState<Date | null>(externalDate)
  const [inputValue, setInputValue] = useState<string>(formatCommittedInput(externalDate))
  const isOpenControlled = open !== undefined
  const [internalOpen, setInternalOpen] = useState(false)
  const isOpen = isOpenControlled ? Boolean(open) : internalOpen
  const [visibleMonth, setVisibleMonth] = useState<Date>(() =>
    resolveVisibleMonthAnchor({ committedDate: externalDate, minDate }),
  )

  useEffect(() => {
    if (isSameDay(externalDate, committedDate)) return

    setCommittedDate(externalDate)
    setInputValue(formatCommittedInput(externalDate))
  }, [committedDate, externalDate])

  const setOpen = useCallback(
    (nextOpen: boolean) => {
      if (!isOpenControlled) {
        setInternalOpen(nextOpen)
      }
      onOpenChange?.(nextOpen)
    },
    [isOpenControlled, onOpenChange],
  )

  const closePopover = useCallback(() => {
    setOpen(false)
  }, [setOpen])

  const openPopover = useCallback(() => {
    if (disabled) return

    setVisibleMonth(resolveVisibleMonthAnchor({ committedDate, minDate }))
    setOpen(true)
  }, [committedDate, disabled, minDate, setOpen])

  const revertToCommitted = useCallback(() => {
    setInputValue(formatCommittedInput(committedDate))
  }, [committedDate])

  const commitDate = useCallback(
    (nextDate: Date | null) => {
      if (nextDate === null) {
        const hadValue = committedDate !== null
        setCommittedDate(null)
        setInputValue('')

        if (hadValue) {
          onChange?.(null)
        }
        return true
      }

      if (!isDateWithinRange({ date: nextDate, minDate, maxDate })) {
        return false
      }

      const hasChanged = !isSameDay(committedDate, nextDate)

      setCommittedDate(nextDate)
      setInputValue(formatDateIso(nextDate))

      if (hasChanged) {
        onChange?.(formatDateIso(nextDate))
      }

      return true
    },
    [committedDate, maxDate, minDate, onChange],
  )

  const tryCommitFromInput = useCallback(() => {
    const trimmed = inputValue.trim()

    if (!trimmed) {
      commitDate(null)
      return
    }

    const parsed = parseIsoDate(trimmed)
    if (!parsed) {
      revertToCommitted()
      return
    }

    const committed = commitDate(parsed)
    if (!committed) {
      revertToCommitted()
    }
  }, [commitDate, inputValue, revertToCommitted])

  const handleInputBlur = useCallback(() => {
    tryCommitFromInput()
  }, [tryCommitFromInput])

  const handleInputKeyDown = useCallback(
    (event: KeyboardEvent<HTMLInputElement>) => {
      if (disabled) return

      if (event.key === 'ArrowDown') {
        event.preventDefault()
        openPopover()
        return
      }

      if (event.key === 'Escape') {
        event.preventDefault()
        revertToCommitted()
        closePopover()
        return
      }

      if (event.key === 'Enter') {
        event.preventDefault()
        tryCommitFromInput()
        return
      }

      if (event.key === 'Tab') {
        tryCommitFromInput()
      }
    },
    [closePopover, disabled, openPopover, revertToCommitted, tryCommitFromInput],
  )

  const handleInputChange = useCallback((value: string) => {
    setInputValue(value)
  }, [])

  const handleCalendarSelect = useCallback(
    (selectedDate: Date) => {
      if (disabled) return

      const committed = commitDate(selectedDate)
      if (!committed) {
        return
      }

      onCalendarSelect?.(selectedDate)
      closePopover()
    },
    [closePopover, commitDate, disabled, onCalendarSelect],
  )

  const handleVisibleMonthChange = useCallback((month: Date) => {
    setVisibleMonth(month)
  }, [])

  return {
    inputValue,
    committedDate,
    isOpen,
    visibleMonth,
    openPopover,
    closePopover,
    handleInputChange,
    handleInputBlur,
    handleInputKeyDown,
    handleCalendarSelect,
    handleVisibleMonthChange,
  }
}
