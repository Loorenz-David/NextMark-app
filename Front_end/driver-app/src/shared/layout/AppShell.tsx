import { NavLink, Outlet } from 'react-router-dom'
import { useConnectivity } from '@/app/providers/connectivity.context'
import { useSession } from '@/app/providers/session.context'
import { useWorkspace } from '@/app/providers/workspace.context'
import { ModeSwitcher } from '@/features/driver-mode/components/ModeSwitcher'

const linkClassName = ({ isActive }: { isActive: boolean }) =>
  `driver-nav__link${isActive ? ' driver-nav__link--active' : ''}`

export function AppShell() {
  const { isOnline } = useConnectivity()
  const { clearSession } = useSession()
  const { workspace } = useWorkspace()

  return (
    <div className="driver-app-shell">
      <header className="driver-topbar">
        <div>
          <div className="driver-kicker">Driver Workspace</div>
          <h1 className="driver-title">Route Pilot</h1>
          <p className="driver-subtitle">
            {workspace?.baseRole === 'independent-driver'
              ? 'Independent driver workspace'
              : 'Team driver workspace'}
          </p>
        </div>
        <div className="driver-topbar__actions">
          <span className={`driver-status-pill ${isOnline ? 'is-online' : 'is-offline'}`}>
            {isOnline ? 'Online' : 'Offline'}
          </span>
          <button className="ghost-button" onClick={clearSession}>Sign out</button>
        </div>
      </header>

      <ModeSwitcher />

      <main className="driver-main">
        <Outlet />
      </main>

      <nav className="driver-nav">
        <NavLink className={linkClassName} to="/route">Assigned Route</NavLink>
        <NavLink className={linkClassName} to="/create/order">Quick Order</NavLink>
        <NavLink className={linkClassName} to="/create/route">Quick Route</NavLink>
      </nav>
    </div>
  )
}
