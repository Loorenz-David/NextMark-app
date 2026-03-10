

import type { OrderCase } from '../types'
import { OrderCaseCard } from './OrderCaseCard'

type OrderCaseListProps = {
  cases: OrderCase[]
  onOpenCase: (orderCaseClientId: string) => void
  onDeleteCase?: (orderCaseId: string) => void
}

export const OrderCaseList = ({ cases, onOpenCase, onDeleteCase }: OrderCaseListProps) => {
  if (!cases.length) {
    return (
      <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-page)] p-4 text-sm text-[var(--color-muted)]">
        No cases yet.
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {cases.map((orderCase) => (
        <OrderCaseCard
          key={orderCase.client_id}
          orderCase={orderCase}
          onOpenCase={onOpenCase}
          onDeleteCase={onDeleteCase}
          
        />
      ))}
    </div>
  )
}
