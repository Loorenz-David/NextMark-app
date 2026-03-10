import { ArchiveIcon, CloseIcon, DocumentIcon, EditIcon } from '@/assets/icons'
import { BasicButton } from '@/shared/buttons/BasicButton'
import type { Order } from '../../types/order'
import { DropdownButton } from '@/shared/buttons/DropdownButton'
import { OrderStateList } from '../lists/OrderStateList'
import { useOrderStateRegistry } from '../../domain/useOrderStateRegistry'
import { CounterBadge } from '@/shared/layout/CounterBadge'
import { toDateOnly } from '@/shared/data-validation/timeValidation'

type OrderDetailHeaderProps = {
    openOrderForm:(payload:{ clientId?: string; mode?: 'create' | 'edit'; deliveryPlanId?: number | null })=> void
    openOrderCases:(payload:{ orderId?: number, orderReference:string })=> void
    onAdvanceOrderState: (clientId: string) => Promise<void>
    onClose: () => void
    order: Order | null
}

export const OrderDetailHeader = ({ 
  openOrderForm,
  openOrderCases,
  onAdvanceOrderState,
  onClose,
  order 
}: OrderDetailHeaderProps) => {
    const registry = useOrderStateRegistry()

    const nextState = registry.getNextStateName(order?.order_state_id)
    const currentStateName = order?.order_state_id != null
      ? (registry.getById(order.order_state_id)?.name ?? 'Unknown state')
      : 'Unknown state'



    return (
        <>
        <div className="flex items-center justify-between gap-3  px-4 py-3 relative bg-[var(--color-primary)] shadow-md"
          style={{ borderRadius:'0 0 20px 20px'}}
        >
          <div className="flex items-center gap-3">
            <div className="inline-flex items-center justify-center rounded-xl bg-[var(--color-muted)]/30 px-3 py-3">
              <DocumentIcon className="h-6 w-6 text-[var(--color-page)]" />
            </div>
            <HeaderTitle order={order}/>
          </div>
          <BasicButton
            params={{
              variant: 'textInvers',
              onClick: onClose,
              ariaLabel: 'Close order detail',
            }}
          >
            close
          </BasicButton>
        </div>
       
        <div className="flex gap-4 p-4 justify-between bg-[var(--color-page)]">
          <div className="flex w-[160px]">
            <DropdownButton
                label={nextState ? `Mark as ${nextState}` : currentStateName}
                style={{fontSize:'12px'}}
                variant="lightBlue"
                fullWidth={true}
                disabled={!order }
                onClick={() => {
                  if (!order) return
                  void onAdvanceOrderState(order.client_id)
                }}
            >
              {order ? (
                <OrderStateList order={order} />
              ) : (
                <div className="px-2 py-2 text-sm text-[var(--color-muted)]">
                  Order not available.
                </div>
              )}
            </DropdownButton>
          </div>  
          <div className="flex gap-3">
              <BasicButton
                  key="order-cases"
                  params={{
                      variant: 'secondary',
                      onClick: () => order?.id && openOrderCases({ orderId: order.id, orderReference: order.reference_number ?? '' }),
                      ariaLabel: 'Edit order',
                  }}
                  >
                  <ArchiveIcon className="mr-2 h-4 w-4 stroke-[var(--color-primary)]" />
                  <div className="flex gap-3">
                    <span>
                      Cases
                    </span>
                    { Boolean(order?.open_order_cases  && order.open_order_cases > 0 ) && 
                      <CounterBadge 
                        text={String(order?.open_order_cases) }
                        bgColor="rgb(255, 213, 3)"
                        textColor="rgb(63, 84, 0)"
                      />
                    }
                  </div>
              </BasicButton>
                
              <BasicButton
                  key="order-detail-edit"
                  params={{
                      variant: 'secondary',
                      onClick: () => order && openOrderForm({ mode: 'edit', clientId: order.client_id }),
                      ariaLabel: 'Edit order',
                  }}
                  >
                  <EditIcon className="mr-2 h-4 w-4 stroke-[var(--color-primary)]" />
                  Edit
              </BasicButton>

          </div>
        </div>
        </ >

    )
}


const HeaderTitle = ({order}:{order:Order | null})=>{
  const title = order?.reference_number ?? 'reference number missing'
  return (
    <div className="flex flex-col ">
        <div className="flex gap-5">
          <span className="text-md font-semibold text-[var(--color-page)]/80">
            {title}
          </span>
          {order?.external_source && 
          <div className="flex items-center justify-center">
            <span className="inline-flex w-fit rounded-full border border-[var(--color-page)] px-2 py-0.5 text-[0.5rem] uppercase tracking-wide text-[var(--color-page)]">
              {order.external_source}
            </span>
          </div>
          }
        </div>
        <div className="flex">
          <span className="text-[10px] flex text-[var(--color-page)]/80 font-normal">
             Created at: {toDateOnly(order?.creation_date ?? null) ?? 'missing creation date'}
          </span>
        </div>
    </div>
  )
}
