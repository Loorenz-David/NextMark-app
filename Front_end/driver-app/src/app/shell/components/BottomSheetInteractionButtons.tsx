import { CurrentLocationIcon } from '@/assets/icons'

type BottomSheetInteractionButtonsProps = {
  isVisible: boolean
  isLocatingCurrentLocation: boolean
  onLocateCurrentLocation: () => void
}

export function BottomSheetInteractionButtons({
  isVisible,
  isLocatingCurrentLocation,
  onLocateCurrentLocation,
}: BottomSheetInteractionButtonsProps) {
  return (
    <div className={`driver-bottom-sheet__actions-strip${isVisible ? ' is-visible' : ''}`}>
      <button
        className="p-3 rounded-full   map-glass-fake-bg"
        disabled={isLocatingCurrentLocation}
        onClick={onLocateCurrentLocation}
        type="button"
      >
        <CurrentLocationIcon
          aria-hidden="true"
          className="h-5 w-5 shrink-0 text-[rgb(var(--bg-strong-light))]"
        />

      </button>
    </div>
  )
}
