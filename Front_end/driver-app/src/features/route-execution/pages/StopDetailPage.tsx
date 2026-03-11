import { useStopDetailController } from '../controllers/useStopDetailController.controller'

type StopDetailPageProps = {
  stopClientId?: string
  onBack: () => void
}

export function StopDetailPage({ stopClientId, onBack }: StopDetailPageProps) {
  const controller = useStopDetailController(stopClientId)

  if (!controller.route || !controller.stop) {
    return (
      <section className="driver-page">
        <div className="empty-panel">
          Stop not found for the current workspace.
          <div className="panel-actions">
            <button className="ghost-button" onClick={onBack} type="button">Back to route</button>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="driver-page">
      <div className="page-header">
        <div>
          <div className="driver-kicker">Stop detail</div>
          <h2>{controller.stop.order?.reference_number ?? controller.stop.stopClientId}</h2>
        </div>
        <button className="ghost-button" onClick={onBack} type="button">Back</button>
      </div>

      <article className="route-card">
        <p><strong>Address:</strong> {controller.stop.address?.street_address ?? 'Not set'}</p>
        <p><strong>ETA:</strong> {controller.stop.expectedArrivalTime ?? 'Unknown'}</p>
        <p><strong>Service:</strong> {controller.stop.serviceLabel}</p>
      </article>

      <div className="panel-actions">
        <button className="ghost-button" onClick={() => void controller.sendAction('arrive-stop')}>Arrive</button>
        <button className="primary-button" onClick={() => void controller.sendAction('complete-stop')}>Complete</button>
        <button className="danger-button" onClick={() => void controller.sendAction('skip-stop')}>Skip</button>
      </div>
    </section>
  )
}
