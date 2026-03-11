import { AssignedRoutePage, StopDetailPage } from '@/features/route-execution'
import { useDriverAppShellChromeController } from '../controllers/useDriverAppShellChrome.controller'
import { useDriverAppShell } from '../providers/driverAppShell.context'
import { useBottomSheetSurfaceController } from '../controllers/useBottomSheetSurface.controller'
import { BottomSheetInteractionButtons } from './BottomSheetInteractionButtons'

export function BottomSheetSurface() {
  const controller = useBottomSheetSurfaceController()
  const chromeController = useDriverAppShellChromeController()
  const { pushBottomSheet, handleSurfaceBack } = useDriverAppShell()

  const currentPage = controller.currentPage

  return (
    <section
      aria-label="Bottom sheet workspace"
      className={`driver-bottom-sheet driver-bottom-sheet--${controller.snap}${controller.motionState === 'snapping' ? ' is-snapping' : ''}`}
      style={{ height: `${controller.heightPercent}%` }}
    >
      <BottomSheetInteractionButtons
        isVisible={controller.showInteractionButtons}
        isLocatingCurrentLocation={chromeController.isLocatingCurrentLocation}
        onLocateCurrentLocation={() => {
          void chromeController.locateCurrentLocation()
        }}
      />

      <button
        aria-label="Drag bottom sheet"
        className="driver-bottom-sheet__handle"
        onPointerDown={controller.handlePointerDown}
        onPointerMove={controller.handlePointerMove}
        onPointerCancel={controller.handlePointerCancel}
        onPointerUp={controller.handlePointerUp}
        type="button"
      >
        <span />
      </button>

      <div className="driver-bottom-sheet__content">
        {currentPage?.page === 'route-workspace' ? (
          <AssignedRoutePage onOpenStopDetail={(stopClientId) => pushBottomSheet('route-stop-detail', { stopClientId })} />
        ) : null}

        {currentPage?.page === 'route-stop-detail' ? (
          <StopDetailPage
            stopClientId={currentPage.params.stopClientId}
            onBack={handleSurfaceBack}
          />
        ) : null}
      </div>
    </section>
  )
}
