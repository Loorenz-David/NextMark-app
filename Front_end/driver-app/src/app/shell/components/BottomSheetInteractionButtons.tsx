import { CurrentLocationIconSrc } from '@shared-icons'

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
        className="p-3 rounded-full driver-bottom-sheet__action-button"
        disabled={isLocatingCurrentLocation}
        onClick={onLocateCurrentLocation}
        type="button"
      >
       
        
      <img alt="" aria-hidden="true" className="h-4 w-4 shrink-0" src={CurrentLocationIconSrc} />

      </button>
    </div>
  )
}
