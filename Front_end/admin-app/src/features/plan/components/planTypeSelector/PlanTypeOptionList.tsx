import { PlanTypeOptionCard } from './PlanTypeOptionCard'
import type { PlanTypeOptions } from './planTypeOptions'
import type { PlanTypeKey } from '../../types/plan'

type Props = {
  selectedValue: PlanTypeKey | null | undefined
  options: PlanTypeOptions[]
  handleSelectOption: (option:PlanTypeKey ) => void
}

export const PlanTypeOptionList = ({
  selectedValue,
  options,
  handleSelectOption
}: Props) => {


  if (!options.length) {
    return (
      <div className="px-3 py-2 text-sm text-[var(--color-muted)]">
        No types found.
      </div>
    )
  }

  return (
    <ul>
      {options.map((option) => {
        const isSelected = option.value === selectedValue
        return (
          <PlanTypeOptionCard
            key={`plan-type-${option.value}`}
            option={option}
            isSelected={isSelected}
            onSelect={handleSelectOption}
          />
        )
      })}
    </ul>
  )
}
