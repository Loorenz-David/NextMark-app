import { resolveOrderOperationBadgeDirections } from '@/features/order/domain/orderOperationBadgeDirections'

type OrderOperationTypeBadgesProps = {
  operationType: string | null | undefined
}

const DirectionArrow = ({ direction }: { direction: 'up' | 'down' }) => {
  if (direction === 'up') {
    return (
      <span
        aria-hidden
        className="h-0 w-0 border-x-[3px] border-b-[5px] border-x-transparent border-b-[var(--color-border-accent)]"
      />
    )
  }

  return (
    <span
      aria-hidden
      className="h-0 w-0 border-x-[3px] border-t-[5px] border-x-transparent border-t-[var(--color-border-accent)]"
    />
  )
}

export const OrderOperationTypeBadges = ({ operationType }: OrderOperationTypeBadgesProps) => {
  const directions = resolveOrderOperationBadgeDirections(operationType)
  if (!directions.length) return null

  return (
    <span className="inline-flex items-center gap-1">
      {directions.map((direction) => (
        <span
          key={direction}
          className="inline-flex h-4 w-4 items-center justify-center rounded-full border border-[var(--color-border-accent)] bg-white"
        >
          <DirectionArrow direction={direction} />
        </span>
      ))}
    </span>
  )
}

