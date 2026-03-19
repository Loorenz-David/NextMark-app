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

  const displayTitle = vehicle.label ?? vehicle.registration_number

  return (
    <div className="rounded-lg border border-[var(--color-border)] bg-white px-4 py-3">
      <button
        type="button"
        onClick={() => setIsExpanded((prev) => !prev)}
        className="flex w-full items-center justify-between text-left"
      >
        <div>
          <p className="text-sm font-semibold text-[var(--color-text)]">{displayTitle}</p>
          <p className="text-xs text-[var(--color-muted)]">
            {vehicle.label && vehicle.label !== vehicle.registration_number
              ? vehicle.registration_number
              : `Travel mode: ${formatValue(vehicle.travel_mode)}`}
          </p>
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
          <div>Registration: {formatValue(vehicle.registration_number)}</div>
          <div>Label: {formatValue(vehicle.label)}</div>
          <div>Fuel type: {formatValue(vehicle.fuel_type)}</div>
          <div>Travel mode: {formatValue(vehicle.travel_mode)}</div>
          <div>Max volume (cm³): {formatValue(vehicle.max_volume_load_cm3)}</div>
          <div>Max weight (g): {formatValue(vehicle.max_weight_load_g)}</div>
          <div>Max speed (km/h): {formatValue(vehicle.max_speed_kmh)}</div>
          <div>Cost per km: {formatValue(vehicle.cost_per_km)}</div>
          <div>Cost per hour: {formatValue(vehicle.cost_per_hour)}</div>
          <div>Distance limit (km): {formatValue(vehicle.travel_distance_limit_km)}</div>
          <div>Duration limit (min): {formatValue(vehicle.travel_duration_limit_minutes)}</div>
          <div>System: {vehicle.is_system ? 'Yes' : 'No'}</div>
        </div>
      ) : null}
    </div>
  )
}
