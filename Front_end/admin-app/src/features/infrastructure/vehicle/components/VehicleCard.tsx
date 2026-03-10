import { useState } from 'react'

import type { Vehicle } from '../types/vehicle'

type VehicleCardProps = {
  vehicle: Vehicle
  onEdit: (clientId: string) => void
}

const formatValue = (value: unknown) => {
  if (value === null || value === undefined || value === '') return '—'
  return String(value)
}

export const VehicleCard = ({ vehicle, onEdit }: VehicleCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <div className="rounded-lg border border-[var(--color-border)] bg-white px-4 py-3">
      <button
        type="button"
        onClick={() => setIsExpanded((prev) => !prev)}
        className="flex w-full items-center justify-between text-left"
      >
        <div>
          <p className="text-sm font-semibold text-[var(--color-text)]">{vehicle.name}</p>
          <p className="text-xs text-[var(--color-muted)]">Travel mode: {formatValue(vehicle.travel_mode)}</p>
        </div>
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation()
            onEdit(vehicle.client_id)
          }}
          className="text-xs text-[var(--color-muted)] hover:text-[var(--color-text)]"
        >
          Edit
        </button>
      </button>
      {isExpanded ? (
        <div className="mt-3 grid gap-2 text-xs text-[var(--color-muted)]">
          <div>Icon: {formatValue(vehicle.icon)}</div>
          <div>Cost per hour: {formatValue(vehicle.cost_per_hour)}</div>
          <div>Cost per kilometer: {formatValue(vehicle.cost_per_kilometer)}</div>
          <div>Travel duration limit: {formatValue(vehicle.travel_duration_limit)}</div>
          <div>Route distance limit: {formatValue(vehicle.route_distance_limit)}</div>
          <div>Driver: {formatValue(vehicle.user_id)}</div>
          <div>Max load: {formatValue(vehicle.max_load)}</div>
          <div>Min load: {formatValue(vehicle.min_load)}</div>
          <div>System: {vehicle.is_system ? 'Yes' : 'No'}</div>
        </div>
      ) : null}
    </div>
  )
}
