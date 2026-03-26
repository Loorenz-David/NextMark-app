import { useMemo } from 'react'
import { CollapsibleSection } from '@/shared/inputs/CollapsibleSection'
import type { PlanTypeSelectorProps } from './PlanTypeSelector.types'
import { PlanTypeOptionList } from './PlanTypeOptionList'
import { planTypeOptions } from './planTypeOptions'


export const PlanTypeSelector = ({
  defaultTitle = 'Select a plan type',
  selectedValue,
  onChange,
  sectionClassName,
  buttonClassName,
}: PlanTypeSelectorProps) => {

  const selectedOption = useMemo(()=>
    planTypeOptions.find((p) => p.value == selectedValue )
    ,[ selectedValue ])

  const PlanTypeIcon = selectedOption?.icon

  const displayValue = selectedOption ? (
    <div className="flex gap-2 items-center">
      <span className="">
        { PlanTypeIcon && 
            <PlanTypeIcon className="h-4 w-4 color-text"/>
          }
      </span>
      <span className="text-sm font-medium text-[var(--color-text)]">
          {selectedOption.label}
      </span>
    </div>
  ) : defaultTitle


  return (
     <CollapsibleSection 
      title={ displayValue } 
      closeOnInsideClick={ true }
      sectionClassName={sectionClassName}
      buttonClassName={buttonClassName}
      >
         <PlanTypeOptionList
          selectedValue = { selectedValue }
          options = { planTypeOptions }
          handleSelectOption = { onChange }
        />
    </CollapsibleSection>
  )
}
