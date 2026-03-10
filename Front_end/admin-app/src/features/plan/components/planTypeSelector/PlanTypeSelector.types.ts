import type { PlanTypeOptions } from './planTypeOptions'

import type { PlanTypeKey } from '../../types/plan'



export type PlanTypeSelectorProps = {
  defaultTitle?:string
  selectedValue: PlanTypeKey | null | undefined
  onChange: (value: PlanTypeKey) => void
  sectionClassName?: string
  buttonClassName?: string
}

export type OrderPlanIntentionSelectorContextValue = {
  isOpen: boolean
  options: PlanTypeOptions[]
  selectedOption: PlanTypeOptions | null
  handleOpenChange: (isOpen: boolean) => void
  handleSelectOption: (option: PlanTypeOptions) => void
}
