import { useDriverAppShell } from '../providers/driverAppShell.context'
import { useMemo, useSyncExternalStore } from 'react'
import { selectSideMenuState } from '../stores/shell.selectors'
import { RoutesList, selectRouteFromSideMenuFlow } from '@/features/routes'
import { useWorkspace } from '@/app/providers/workspace.context'
import { useDriverAppShellChromeController } from '../controllers/useDriverAppShellChrome.controller'
import { TemporaryLogoutButton } from './TemporaryLogoutButton'

export function SideMenuSurface() {
  const shell = useDriverAppShell()
  const chromeController = useDriverAppShellChromeController()
  const { workspace } = useWorkspace()
  const { store, closeSideMenu } = shell
  const shellState = useSyncExternalStore(
    store.subscribe,
    store.getState,
    store.getState,
  )
  const sideMenuState = useMemo(() => selectSideMenuState(shellState), [shellState])

  return (
    <section className={` driver-side-menu-surface${sideMenuState.isOpen ? ' is-open' : ''}`}>
      <button
        aria-label="Close side menu"
        className="driver-side-menu-surface__backdrop"
        onClick={closeSideMenu}
        type="button"
      />
      <aside className="driver-side-menu-surface__panel map-glass-fake-strong-bg">
        <div className="flex h-full flex-col gap-4 overflow-y-auto px-4 py-5">
          <header className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Workspace</p>
            <h2 className="text-lg font-semibold text-slate-900">Routes</h2>
          </header>

          <RoutesList
            onSelectRoute={(routeClientId) => {
              if (!workspace) {
                return
              }

              selectRouteFromSideMenuFlow({
                routeClientId,
                workspaceScopeKey: workspace.workspaceScopeKey,
                shell,
              })
            }}
          />

          <div className="mt-auto pt-4">
            <TemporaryLogoutButton
              onLogout={() => {
                closeSideMenu()
                chromeController.clearSession()
              }}
            />
          </div>
        </div>
      </aside>
    </section>
  )
}
