import type { LocalDeliveryConsumptionMetric } from './LocalDeliveryStatsOverlay.types'

type LocalDeliveryConsumptionStatsColumnProps = {
  metrics: LocalDeliveryConsumptionMetric[]
}

export const LocalDeliveryConsumptionStatsColumn = ({
  metrics,
}: LocalDeliveryConsumptionStatsColumnProps) => (
  <div className="flex min-w-[160px] flex-col gap-3">
    {metrics.map((metric) => (
      <div
        key={metric.id}
        className="flex min-h-[78px] flex-col justify-between rounded-2xl border border-white/45 bg-black/28 px-4 py-3 text-sm text-white backdrop-blur-md"
      >
        <div className="text-sm font-semibold text-white">{metric.displayValue}</div>
        <div className="text-xs font-medium text-white/76">{metric.label}</div>
      </div>
    ))}
  </div>
)
