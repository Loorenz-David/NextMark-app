import { EditIcon, PlusIcon } from '@/assets/icons'
import type { DeliveryPlan } from '@/features/plan/types/plan'
import { planIconTypeMap } from '@/features/plan/utils/planIconTypeMap'
import { BasicButton } from '@/shared/buttons'
import { SectionHeader } from '@/shared/section-panel/SectionHeader'

import type { useInternationalShippingHeaderAction } from '../../hooks/useInternationalShippingHeaderAction'

type InternationalShippingMainHeaderProps = {
  plan: DeliveryPlan | null
  actions: ReturnType<typeof useInternationalShippingHeaderAction>
}

export const InternationalShippingMainHeader = ({
  plan,
  actions,
}: InternationalShippingMainHeaderProps) => {
  const PlanTypeIcon = planIconTypeMap.international_shipping
  const title = plan?.label ?? 'Plan'

  return (
    <>
      <SectionHeader
        title={title}
        icon={<PlanTypeIcon className="h-6 w-6 text-[var(--color-muted)]" />}
        closeButton
      />
      <div className="flex flex-col gap-4 w-full px-5 py-3">
        <div className="flex gap-4 w-full">
          <BasicButton
            params={{ variant: 'primary', onClick: actions.handleCreateOrder, ariaLabel: 'Create order' }}
          >
            <PlusIcon className="w-4 h-4 mr-2 stroke-[var(--color-secondary)]" />
            Order
          </BasicButton>
          <BasicButton
              params={{ variant: 'secondary', onClick: actions.handleEditPlan, ariaLabel: 'Edit local delivery plan' }}
          >
              <EditIcon className="w-4 h-4 mr-2 stroke-[var(--color-secondary)]" />
              Edit
          </BasicButton>
        </div>
      </div>
    </>
  )
}
