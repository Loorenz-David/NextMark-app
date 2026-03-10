import { MessageIcon } from '@/assets/icons'
import { BasicButton } from '@/shared/buttons/BasicButton'

import type { OrderCaseState } from '../../types'
import { OrderCaseStateSelector } from '../OrderCaseStateSelector'

type OrderCaseDetailsHeaderProps = {
  title: string
  state: OrderCaseState
  onChangeState: (nextState: OrderCaseState) => void
  onClose: () => void
}

export const OrderCaseDetailsHeader = ({
  title,
  state,
  onChangeState,
  onClose,
}: OrderCaseDetailsHeaderProps) => {
  return (
    <>
      <div className="flex items-center justify-between gap-3 border-b border-[var(--color-border)] px-4 py-3 bg-[var(--color-primary)] shadow-md"
        style={{ borderRadius:'0 0 20px 20px'}}
      >
        <div className="flex items-center gap-3">
          <div className="inline-flex items-center justify-center rounded-xl bg-[var(--color-page)]/10 px-3 py-3">
            <MessageIcon className="h-6 w-6 text-[var(--color-page)]" />
          </div>
          <div className="flex flex-col text-[var(--color-page)]/80">
            <span className="font-semibold text-lg">
              {title}
            </span>
            <span className="text-xs">

            </span>
          </div>
        </div>
        <BasicButton
          params={{
            variant: 'text',
            onClick: onClose,
            ariaLabel: 'Close case details',
            style:{backgroundColor:'transparent',color:'var(--color-page)'}
          }}
        >
          Close
        </BasicButton>
      </div>

      <div className="p-3">
        <OrderCaseStateSelector value={state} onSelect={onChangeState} />
      </div>
    </>
  )
}
