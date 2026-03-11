import { DriverMenuPage } from './DriverMenuPage'
import { useDriverAppShellChromeController } from '../controllers/useDriverAppShellChrome.controller'
import { useDriverAppShell } from '../providers/driverAppShell.context'
import { useMemo, useSyncExternalStore } from 'react'
import { selectSideMenuState } from '../stores/shell.selectors'

export function SideMenuSurface() {
  const controller = useDriverAppShellChromeController()
  const { store, closeSideMenu } = useDriverAppShell()
  const shellState = useSyncExternalStore(
    store.subscribe,
    store.getState,
    store.getState,
  )
  const sideMenuState = useMemo(() => selectSideMenuState(shellState), [shellState])

  return (
    <section className={`driver-side-menu-surface${sideMenuState.isOpen ? ' is-open' : ''}`}>
      <button
        aria-label="Close side menu"
        className="driver-side-menu-surface__backdrop"
        onClick={closeSideMenu}
        type="button"
      />
      <aside className="driver-side-menu-surface__panel">
        {sideMenuState.currentPage?.page === 'menu-home' ? (
          <DriverMenuPage
            onOpenShellHelp={controller.openShellHelp}
            onSignOut={controller.clearSession}
            workspace={controller.workspace}
          />
        ) : null}
      </aside>
    </section>
  )
}
