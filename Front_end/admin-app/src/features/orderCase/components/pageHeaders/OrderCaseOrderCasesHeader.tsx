import { ArchiveIcon, PlusIcon } from '@/assets/icons'
import { BasicButton } from '@/shared/buttons/BasicButton'
import type { OrderCaseStats } from '../../types/orderCaseMeta'
import { pluralLabel } from '@/shared/utils/formatStrings'

type OrderCaseOrderCasesHeaderProps = {
  onCreateCase: () => void
  onClose: () => void
  orderCaseStats?:OrderCaseStats
}

export const OrderCaseOrderCasesHeader = ({
  orderCaseStats,
  onCreateCase,
  onClose,
}: OrderCaseOrderCasesHeaderProps) => {
  return (
    <>
      <div className="flex items-center justify-between gap-3  px-4 py-3 bg-[var(--color-primary)] shadow-md"
        style={{ borderRadius:'0 0 20px 20px'}}
      >
        <div className="flex items-center gap-3">
          <div className="inline-flex items-center justify-center rounded-xl bg-[var(--color-muted)]/30 px-3 py-3">
            <ArchiveIcon className="h-6 w-6 text-[var(--color-page)]" />
          </div>
          <HeaderTitle orderCaseStats={orderCaseStats}/>
        </div>
        <BasicButton
          params={{
            variant: 'textInvers',
            onClick: onClose,
            ariaLabel: 'Close order cases',
          }}
        >
          Close
        </BasicButton>
      </div>

      <div className="flex items-center justify-end gap-3 p-3 pt-4">
        <BasicButton
          params={{
            variant: 'primary',
            onClick: onCreateCase,
            ariaLabel: 'Create case',
          }}
        >
          <PlusIcon className="mr-2 h-4 w-4 stroke-[var(--color-secondary)]" />
           Case
        </BasicButton>
      </div>
    </>
  )
}


const HeaderTitle = ({orderCaseStats}:{orderCaseStats?:OrderCaseStats})=>{
  const caseCount = orderCaseStats?.order_cases.total ?? 0
  const openCount = orderCaseStats?.open_cases.total ?? 0
  const resolvingCount = orderCaseStats?.resolving_cases.total  ?? 0
  return (
    <div className="flex gap-2">
      <div className="flex flex-col">
        <span className="font-semibold text-lg text-[var(--color-page)]/80">
          Order Cases
        </span>
        <div className="text-[10px] flex text-[var(--color-page)]/80 font-normal flex gap-1">
          <span > {caseCount} {pluralLabel('case',caseCount)} •  </span>
          <span > {openCount} {pluralLabel('open',openCount)} •  </span>
          <span > {resolvingCount} {pluralLabel('resolving',resolvingCount)}  </span>
        </div>
      </div>
    </div>
  )
}
