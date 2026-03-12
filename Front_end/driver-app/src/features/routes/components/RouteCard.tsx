type RouteCardProps = {
  label: string
  dateRangeLabel: string
  isSelected?: boolean
  onSelect?: () => void
}

export function RouteCard({ label, dateRangeLabel, isSelected = false, onSelect }: RouteCardProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`w-full rounded-lg border px-4 py-3 text-left shadow-sm transition ${
        isSelected
          ? 'border-emerald-300 bg-emerald-50/80'
          : 'border-slate-200/80 bg-white'
      }`}
    >
      <p className="text-sm font-semibold text-slate-900">{label}</p>
      <p className="mt-1 text-xs text-slate-500">{dateRangeLabel}</p>
    </button>
  )
}
