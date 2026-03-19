import { useState, useRef, useCallback, useMemo } from 'react'

import { useVehicles } from '../../hooks/useVehicleSelectors'
import type { VehicleSelectorProps } from './VehicleSelector.types'

export const useVehicleSelectorControllers = ({
  selectedVehicle,
  onSelectVehicle,
}: VehicleSelectorProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const allVehicles = useVehicles()

  const options = useMemo(
    () =>
      allVehicles
        .filter((v) => v.id != null)
        .map((v) => ({
          id: v.id!,
          label: v.label ?? v.registration_number,
          registration_number: v.registration_number,
        })),
    [allVehicles],
  )

  const selectedLabel = useMemo(() => {
    if (!selectedVehicle) return null
    const found = options.find((v) => v.id === selectedVehicle)
    return found ? found.label : null
  }, [selectedVehicle, options])

  const filteredOptions = useMemo(() => {
    const search = inputValue.toLowerCase().trim()
    if (!search) return options
    return options.filter(
      (v) =>
        v.label.toLowerCase().includes(search) ||
        v.registration_number.toLowerCase().includes(search),
    )
  }, [options, inputValue])

  const handleOpenChange = useCallback((open: boolean) => {
    setIsOpen(open)
    if (!open) setInputValue('')
  }, [])

  const handleInputFocus = useCallback(() => {
    setIsOpen(true)
    setInputValue('')
  }, [])

  const handleInputChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value)
    setIsOpen(true)
  }, [])

  const handleSelectVehicle = useCallback(
    (vehicleId: number, _label: string) => {
      onSelectVehicle(vehicleId)
      setIsOpen(false)
      setInputValue('')
    },
    [onSelectVehicle],
  )

  const handleClearVehicle = useCallback(() => {
    onSelectVehicle(null)
    setInputValue('')
    setIsOpen(false)
  }, [onSelectVehicle])

  return {
    isOpen,
    inputValue,
    selectedLabel,
    filteredOptions,
    inputRef,
    handleOpenChange,
    handleInputFocus,
    handleInputChange,
    handleSelectVehicle,
    handleClearVehicle,
  }
}
