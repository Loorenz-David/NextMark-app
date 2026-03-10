import { CaseRegistry } from '../domain/orderCase.model'
import type { OrderCaseState } from '../types'

type OrderCaseStateSelectorProps = {
  value: OrderCaseState
  onSelect: (state: OrderCaseState) => void
}


export const OrderCaseStateSelector = ({ value, onSelect }: OrderCaseStateSelectorProps) => {
  return (
    <div className="inline-flex rounded-lg border border-[var(--color-border)] bg-[var(--color-page)] p-1">
      {Object.values(CaseRegistry).map((state) => {
        const isActive = state === value

        return (
          <button
            key={state}
            type="button"
            onClick={() => onSelect(state)}
            className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
              isActive
                ? 'bg-[var(--color-green-turquess)] text-[var(--color-secondary)]'
                : 'text-[var(--color-muted)] hover:bg-[var(--color-muted)]/10'
            }`}
          >
            {state}
          </button>
        )
      })}
    </div>
  )
}
