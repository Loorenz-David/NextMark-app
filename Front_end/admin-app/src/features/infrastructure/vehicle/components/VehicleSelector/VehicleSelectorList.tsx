import { useVehicleSelectorContext } from './VehicleSelector.context'

export const VehicleSelectorList = () => {
  const { filteredOptions, handleSelectVehicle, handleClearVehicle } = useVehicleSelectorContext()

  return (
    <div className="max-h-48 overflow-y-auto scroll-thin">
      <button
        type="button"
        onClick={handleClearVehicle}
        className="w-full rounded-lg px-3 py-2 text-left text-sm text-[var(--color-muted)] hover:bg-white/[0.08]"
      >
        None
      </button>
      {filteredOptions.length === 0 && (
        <p className="px-3 py-2 text-sm text-[var(--color-muted)]">No vehicles found</p>
      )}
      {filteredOptions.map((v) => (
        <button
          key={v.id}
          type="button"
          onClick={() => handleSelectVehicle(v.id, v.label)}
          className="w-full rounded-lg px-3 py-2 text-left text-sm text-[var(--color-text)] hover:bg-white/[0.08]"
        >
          <span className="font-medium">{v.label}</span>
          {v.label !== v.registration_number && (
            <span className="ml-2 text-xs text-[var(--color-muted)]">({v.registration_number})</span>
          )}
        </button>
      ))}
    </div>
  )
}
