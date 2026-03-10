type InlineRouteMetricProps = {
  label: string
  value: string
  delta?: string | null
}

export const InlineRouteMetric = ({ label, value, delta }: InlineRouteMetricProps) => (
  <div className="flex min-h-[52px] flex-col justify-between rounded-2xl bg-white/6 px-3 py-2 text-white">
    <div className="flex items-baseline gap-2">
      <span className="text-sm font-semibold">{value || '—'}</span>
      {delta ? <span className="text-[10px] font-medium text-white/72">{delta}</span> : null}
    </div>
    <span className="text-[11px] font-medium uppercase tracking-[0.08em] text-white/68">
      {label || ' '}
    </span>
  </div>
)
