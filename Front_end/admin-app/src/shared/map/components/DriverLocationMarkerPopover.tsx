import { MarkerAnchorPopover } from './MarkerAnchorPopover'
import { formatIsoToTeamTimeZone } from '@/shared/utils/teamTimeZone'
import type { DriverLocationUpdatedPayload } from '@shared-realtime'

type DriverLocationMarkerPopoverProps = {
  open: boolean
  anchorEl: HTMLElement | null
  position: DriverLocationUpdatedPayload | null
  onOpenChange: (open: boolean) => void
}

const formatRecordedAt = (value?: string | null) => {
  if (!value) return '—'
  const teamValue = formatIsoToTeamTimeZone(value, { forceTeamTimeZone: true })
  return teamValue ? teamValue.replace('T', ' ') : '—'
}

const formatCoordinate = (value?: number | null) => (
  typeof value === 'number' && Number.isFinite(value) ? value.toFixed(6) : '—'
)

export const DriverLocationMarkerPopover = ({
  open,
  anchorEl,
  position,
  onOpenChange,
}: DriverLocationMarkerPopoverProps) => {
  if (!position) return null

  return (
    <MarkerAnchorPopover
      open={open}
      anchorEl={anchorEl}
      onOpenChange={onOpenChange}
      className="z-50"
    >
      <div className="min-w-[220px] rounded-xl border border-[var(--color-border)] bg-white px-3 py-3 shadow-xl">
        <div className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--color-muted)]">
          Driver Location
        </div>
        <div className="mt-2 flex flex-col gap-2 text-sm text-[var(--color-text)]">
          <div className="flex items-start justify-between gap-3">
            <span className="text-[var(--color-muted)]">Recorded</span>
            <span className="text-right font-medium">{formatRecordedAt(position.timestamp)}</span>
          </div>
          <div className="flex items-start justify-between gap-3">
            <span className="text-[var(--color-muted)]">Lat</span>
            <span className="font-medium">{formatCoordinate(position.coords?.lat)}</span>
          </div>
          <div className="flex items-start justify-between gap-3">
            <span className="text-[var(--color-muted)]">Lng</span>
            <span className="font-medium">{formatCoordinate(position.coords?.lng)}</span>
          </div>
        </div>
      </div>
    </MarkerAnchorPopover>
  )
}
