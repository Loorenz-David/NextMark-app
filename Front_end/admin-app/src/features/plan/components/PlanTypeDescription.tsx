import type { PlanTypeKey } from '@/features/plan/types/plan'

type PlanTypeDescriptionProps = {
  planType: PlanTypeKey
}

const PLAN_TYPE_DESCRIPTIONS: Record<PlanTypeKey, string> = {
  local_delivery:
    'Optimize routes and manage stop-by-stop execution for same-day or scheduled local deliveries.',
  international_shipping:
    'Handle cross-border planning with carrier-oriented execution for longer-haul shipments.',
  store_pickup:
    'Coordinate pickup-ready orders, locations, and supervisors for in-store fulfillment workflows.',
}

export const PlanTypeDescription = ({ planType }: PlanTypeDescriptionProps) => {
  return (
    <p className="mt-2 rounded-md border border-[var(--color-muted)]/20 bg-[var(--color-primary)]/5 p-3 text-xs text-[var(--color-muted)]">
      {PLAN_TYPE_DESCRIPTIONS[planType]}
    </p>
  )
}
