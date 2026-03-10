

import { StateCard } from '@/shared/layout/StateCard'
import { formatIsoDateRelative } from '@/shared/utils/formatIsoDate'
import type { OrderCase } from '../types'
import { ConfirmActionButton } from '@/shared/buttons/DeleteButton'

type PropsOrderCaseCard = {
orderCase: OrderCase
onOpenCase: (caseId:string) => void
onDeleteCase?:(caseId:string) => void
}
export const OrderCaseCard = ({
    orderCase,
    onOpenCase,
    onDeleteCase
}: PropsOrderCaseCard) => {


    const relativeCreationDate = formatIsoDateRelative(orderCase.creation_date)

    return ( 
        <div
          key={orderCase.client_id}
          className="rounded-lg border border-[var(--color-muted)]/40 bg-[var(--color-page)] p-3 cursor-pointer"
          onClick={() => onOpenCase(orderCase.client_id)}
        >
          <div
            role="button"
            className="flex w-full items-start justify-between gap-3 text-left "
            
          >
            <div className="flex flex-col gap-1">
              <div className="flex gap-4 items-center">
                <span className="text-sm font-semibold text-[var(--color-text)]">
                  {orderCase.label?.trim() ? orderCase.label : `Case #${orderCase.id}`}
                </span>
                <div className="self-stretch w-px bg-[var(--color-border)]"></div>
                <span className="text-xs text-[var(--color-muted)]">Order # {orderCase.order_reference}</span>
              </div>
             
            </div>

            <div className="flex flex-col items-end gap-2">
              <StateCard label={orderCase.state} style={{ maxWidth: '110px' }} />
              {orderCase.unseen_chats > 0 ? (
                <span className="rounded-full bg-[var(--color-primary)]/10 px-2 py-0.5 text-[10px] font-semibold text-[var(--color-primary)]">
                  {orderCase.unseen_chats} unseen
                </span>
              ) : null}
            </div>
          </div>

          <div className="mt-3 flex justify-between items-start">
            <span className="text-[9px] text-[var(--color-muted)]">
              {relativeCreationDate ?? orderCase.creation_date}
            </span>
            {onDeleteCase ? (
                <ConfirmActionButton
                      onConfirm={ () => onDeleteCase(orderCase.client_id)}
                      deleteContent={"Delete"}
                      confirmContent={'Confirm deletion'}
                      deleteClassName="text-red-500 text-[12px] px-2 py-1 "
                      confirmClassName="text-white text-[10px] px-2 py-1 rounded-md bg-red-500"
                />
                
              ) : null}
          </div>
        </div>
    );
}
