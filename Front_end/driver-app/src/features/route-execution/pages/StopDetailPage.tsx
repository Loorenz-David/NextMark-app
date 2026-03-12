import { useStopDetailController } from '../controllers/useStopDetailController.controller'
import { StopDetailBody, StopDetailHeader } from '../components/stop-detail'

type StopDetailPageProps = {
  stopClientId?: string
  onBack: () => void
}

export function StopDetailPage({ stopClientId, onBack }: StopDetailPageProps) {
  const controller = useStopDetailController(stopClientId)

  if (!controller.route || !controller.stop || !controller.pageDisplay) {
    return (
      <section className="px-5 py-6">
        <div className="rounded-3xl border border-white/12 bg-white/6 px-4 py-5 text-sm text-white/70">
          Stop not found for the current workspace.
          <div className="mt-4">
            <button className="rounded-xl border border-white/20 px-4 py-2 text-white" onClick={onBack} type="button">Back to route</button>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="flex h-full min-h-0 flex-col ">
      <StopDetailHeader
        header={controller.pageDisplay.header}
        onClose={onBack}
        primaryActions={controller.pageDisplay.primaryActions}
      />
      <StopDetailBody rows={controller.pageDisplay.infoRows} />
    </section>
  )
}
