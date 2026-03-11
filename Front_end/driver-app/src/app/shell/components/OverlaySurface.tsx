import { useMemo, useSyncExternalStore } from 'react'
import { useDriverAppShell } from '../providers/driverAppShell.context'
import { selectOverlayState } from '../stores/shell.selectors'
import { ShellOverlayPlaceholderPage } from './ShellOverlayPlaceholderPage'

export function OverlaySurface() {
  const { store, closeOverlay } = useDriverAppShell()
  const shellState = useSyncExternalStore(
    store.subscribe,
    store.getState,
    store.getState,
  )
  const overlayState = useMemo(() => selectOverlayState(shellState), [shellState])

  return (
    <section className={`driver-overlay-surface${overlayState.isOpen ? ' is-open' : ''}`}>
      {overlayState.currentPage?.page === 'shell-overlay-placeholder' ? (
        <ShellOverlayPlaceholderPage
          message={overlayState.currentPage.params.message}
          onClose={closeOverlay}
          title={overlayState.currentPage.params.title}
        />
      ) : null}
    </section>
  )
}
