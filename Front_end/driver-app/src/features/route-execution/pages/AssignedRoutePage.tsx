import { useAssignedRouteController } from '../controllers/useAssignedRouteController.controller'

type AssignedRoutePageProps = {
  onOpenStopDetail: (stopClientId: string) => void
}

export function AssignedRoutePage({ onOpenStopDetail }: AssignedRoutePageProps) {
  const controller = useAssignedRouteController()

  if (!controller.workspace) {
    return null
  }

  return (
    <section className="driver-page">
      <div className="page-header">
        <div>
          <div className="driver-kicker">Assigned route execution</div>
          <h2>Current workspace route</h2>
        </div>
        <button className="ghost-button" onClick={() => void controller.refreshAssignedRoute()}>
          Refresh
        </button>
      </div>

      {!controller.bootstrap.restoredSession ? (
        <div className="empty-panel">Restore a session to load the active driver workspace.</div>
      ) : null}

      {controller.routeState.status === 'loading' ? (
        <div className="empty-panel">Loading assigned route…</div>
      ) : null}

      {controller.routeState.status === 'error' ? (
        <div className="empty-panel">{controller.routeState.error ?? 'Unable to load route.'}</div>
      ) : null}

      {controller.routeState.status === 'ready' && !controller.routeState.route ? (
        <div className="empty-panel">
          No assigned route was returned for this workspace yet.
        </div>
      ) : null}

      {controller.routeState.route ? (
        <div className="route-stack">
          <article className="route-card">
            <div className="route-card__header">
              <div>
                <h3>{controller.routeState.route.label || 'Unnamed route'}</h3>
                <p className="driver-subtitle">
                  {controller.routeState.route.completedStops}/{controller.routeState.route.totalStops} stops completed
                </p>
              </div>
              <span className="driver-status-pill is-online">
                {controller.workspace.baseRole}
              </span>
            </div>

            <div className="route-summary-grid">
              <div>
                <span className="summary-label">Start</span>
                <strong>{controller.routeState.route.startLocation?.street_address ?? 'Not set'}</strong>
              </div>
              <div>
                <span className="summary-label">End</span>
                <strong>{controller.routeState.route.endLocation?.street_address ?? 'Not set'}</strong>
              </div>
            </div>

            <button className="primary-button" onClick={() => void controller.startRoute()}>
              Start route command
            </button>
          </article>

          <div className="stop-list">
            {controller.routeState.route.stops.map((stop) => (
              <button
                className="stop-card"
                key={stop.stopClientId}
                onClick={() => onOpenStopDetail(stop.stopClientId)}
                type="button"
              >
                <div>
                  <div className="driver-kicker">Stop {stop.stopOrder ?? '—'}</div>
                  <strong>{stop.order?.reference_number ?? stop.stopClientId}</strong>
                  <p className="driver-subtitle">{stop.address?.street_address ?? 'Address pending'}</p>
                </div>
                <span className={`driver-status-pill ${stop.isCompleted ? 'is-muted' : 'is-online'}`}>
                  {stop.etaStatus ?? (stop.isCompleted ? 'Completed' : 'Active')}
                </span>
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </section>
  )
}
