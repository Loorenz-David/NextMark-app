import type { address } from '@/types/address'
import {  TimeIcon } from '@/assets/icons'
import type { RouteSolutionWarning } from '@/features/plan/planTypes/localDelivery/types/routeSolution'
import { RouteSolutionWarnings } from '@/features/plan/planTypes/localDelivery/components/warnings/RouteSolutionWarnings'
import type { RouteSolutionWarningRegistry } from '@/features/plan/planTypes/localDelivery/domain/routeSolutionWarningRegistry'
import type { useLocalDeliveryActions } from '@/features/plan/planTypes/localDelivery/actions/useLocalDeliveryActions'

type LocalDeliveryBoundaryLocationCardProps = {
  label: string
  address: address
  time:string | null
  warnings?: RouteSolutionWarning[] | null
  planStartDate?: string | null
  warningRegistry: RouteSolutionWarningRegistry
  localDeliveryActions: ReturnType<typeof useLocalDeliveryActions>
  containerClassName?:string
}

export const LocalDeliveryBoundaryLocationCard = ({
  label,
  address,
  time,
  warnings,
  planStartDate,
  warningRegistry,
  localDeliveryActions,
  containerClassName
}: LocalDeliveryBoundaryLocationCardProps) => {
  const streetAddress = address?.street_address ?? '—'
  
  return (
    <div className={`flex justify-between rounded-2xl border border-[var(--color-muted)]/30 bg-white p-4 ${containerClassName}`}>
      <div className="flex flex-col gap-1 ">
        <span className="text-[0.6rem] font-semibold uppercase tracking-wide text-[var(--color-text)]/80">
          {label}
        </span>
        <span className="truncate text-xs text-[var(--color-muted)]">{streetAddress}</span>
      </div>
      <div className="flex flex-col justify-end text-xs text-[var(--color-muted)]">
        <div className="flex items-center gap-2">
          <RouteSolutionWarnings
            warnings={warnings}
            planStartDate={planStartDate}
            registry={warningRegistry}
            localDeliveryActions={localDeliveryActions}
          />
          <TimeIcon className="h-3 w-3 app-icon" />
          {time}
        </div>
      </div>
    </div>
  )
}
