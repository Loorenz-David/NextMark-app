import type { PlanTypeOptions } from './planTypeOptions'
import type { PlanTypeKey } from '../../types/plan'


type PlanTypeOptionCardProps = {
  option: PlanTypeOptions
  onSelect: (option: PlanTypeKey) => void
  isSelected: boolean
}

export const PlanTypeOptionCard = ({
  option,
  isSelected,
  onSelect,
}: PlanTypeOptionCardProps) => {
  const PlanTypeIcon = option?.icon
  return (
    <li>
      <button
        type="button"
        className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left hover:bg-[var(--color-page)]"
        onMouseDown={(event) => event.preventDefault()}
        onClick={() => onSelect(option.value)}
        data-popover-close
      >
        <span className="h-4 w-4 bg-[var(--color-page)]">
          { PlanTypeIcon && 
            <PlanTypeIcon className="h-4 w-4"/>
          }
        </span>
        <span className="text-sm font-medium text-[var(--color-text)]">
          {option.label}
        </span>
        {isSelected && (
          <div className="ml-auto h-2 w-2 rounded-full bg-green-600" />
        )}
      </button>
    </li>
  )
}
