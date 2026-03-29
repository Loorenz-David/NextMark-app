import { useMemo, useState } from 'react'

import { ObjectLinkSelector } from '@/shared/inputs/ObjectLinkSelector'

import { mapVehicleToSelectorItem } from '../../domain/vehicleSelector.domain'
import { useHydrateSelectedVehicles } from '../../hooks/useHydrateSelectedVehicles'
import { useVehicles } from '../../hooks/useVehicleSelectors'
import { useVehicleSelectorQuery } from '../../hooks/useVehicleSelectorQuery'
import type { VehicleSelectorProps } from './VehicleSelector.types'

export const VehicleSelector = ({
  selectedVehicle,
  onSelectVehicle,
  placeholder = 'Select a vehicle',
  containerClassName,
}: VehicleSelectorProps) => {
  const [query, setQuery] = useState('')
  const vehicles = useVehicles()
  const selectedVehicleIds = useMemo(
    () => (selectedVehicle != null ? [selectedVehicle] : []),
    [selectedVehicle],
  )
  useHydrateSelectedVehicles(selectedVehicleIds)
  const { items, isLoading } = useVehicleSelectorQuery({ query })

  const selectedItems = useMemo(() => {
    const selectedIdSet = new Set(selectedVehicleIds.map(String))
    return vehicles
      .filter((vehicle) => vehicle.id != null)
      .filter(
        (vehicle) =>
          selectedIdSet.has(String(vehicle.id ?? '')) ||
          selectedIdSet.has(String(vehicle.client_id)),
      )
      .map(mapVehicleToSelectorItem)
  }, [selectedVehicleIds, vehicles])

  const options = useMemo(
    () => items.filter((vehicle) => vehicle.id != null).map(mapVehicleToSelectorItem),
    [items],
  )

  return (
    <ObjectLinkSelector
      mode="single"
      options={options}
      selectedItems={selectedItems}
      queryValue={query}
      onQueryChange={setQuery}
      loading={isLoading}
      placeholder={placeholder}
      containerClassName={containerClassName}
      emptyOptionsMessage="No vehicles found."
      emptySelectedMessage="No selected vehicles."
      selectedOverlayTitle="Selected vehicles"
      selectedButtonLabel="Vehicle"
      onSelectItem={(item) => {
        setQuery('')
        onSelectVehicle(typeof item.id === 'number' ? item.id : Number(item.id))
      }}
      onRemoveSelectedItem={() => {
        setQuery('')
        onSelectVehicle(null)
      }}
    />
  )
}
