
import type { Order } from '@/features/order/types/order'
import { ItemIcon, TimeIcon } from '@/assets/icons'
import { StateCard } from '@/shared/layout/StateCard'
import { useSectionManager, useMapManager } from '@/shared/resource-manager/useResourceManager'
import { useOrderStateByServerId } from '@/features/order/store/orderStateHooks.store'
import type { RouteSolutionStop } from '@/features/plan/planTypes/localDelivery/types/routeSolutionStop'
import { RouteStopWarnings } from '../warnings/RouteStopWarnings'
import { formatRouteTime } from '@/features/plan/planTypes/localDelivery/utils/formatRouteTime'
import { useOrderActions } from '@/features/order'
import { LottieSpinner } from '@/shared/spiners'
import { StopOrderAvatar } from './StopOrderAvatar'
import { OrderOperationTypeBadges } from '@/features/order/components/cards/OrderOperationTypeBadges'

type LocalDeliveryOrderCardProps = {
    order: Order;
    stop?: RouteSolutionStop | null;
    displayStopOrder?: number | null;
    planStartDate?: string | null;
}

export const LocalDeliveryOrderCard = ({ order, stop, displayStopOrder, planStartDate }: LocalDeliveryOrderCardProps) => {
    const {openOrderDetail} = useOrderActions()
    const mapManager = useMapManager()
    const orderLabel = order.order_scalar_id != null ? `#${order.order_scalar_id}` : '#—'
    const streetAddress = order.client_address?.street_address ?? 'No address'
    const expectedArrival = stop && stop.expected_arrival_time !== 'loading'  ? formatRouteTime(stop.expected_arrival_time, planStartDate) : null
    const itemCount = order.total_items ?? 0
    const stopOrder = typeof displayStopOrder === 'number'
        ? displayStopOrder
        : typeof stop?.stop_order == 'number'
            ? stop.stop_order
            : null
    const orderState =  useOrderStateByServerId( order.order_state_id ?? 1 )

    const openOrder = ()=>{
        mapManager.selectOrder(order.client_id)
        openOrderDetail(
            {mode:"edit", clientId:order.client_id},
            { borderLeft:'rgb(var(--color-light-blue-r),0.7)'}
        )
        
    }
    

    return ( 
        <div className="flex flex-col gap-3 rounded-2xl border border-[var(--color-muted)]/30 bg-white p-4 pl-2 "
            onClick={openOrder}
        >

            <div className="flex gap-3 w-full">
                <StopOrderAvatar stopOrder={stopOrder} />
                <div className="flex min-w-0 flex-col gap-2 flex-1 pl-1">
                        <div className="flex justify-between">
                            <div className="flex gap-3">
                                <div className="flex items-center gap-2 min-w-0">
                                    <span className="text-base font-semibold text-[var(--color-text)]">
                                        {orderLabel}
                                    </span>
                                    <OrderOperationTypeBadges operationType={order.operation_type} />
                                </div>
                                {order.external_source && (
                                <div className="flex items-center justify-center">
                                    <span className="shrink-0 rounded-full border border-[var(--color-border)] px-2 py-0.5 text-[0.5rem] uppercase tracking-wide text-[var(--color-muted)]">
                                        {order.external_source}
                                    </span>
                                </div>
                                )}
                            </div>
                            { orderState && 
                                <div className="flex gap-3 items-center">
                                    <RouteStopWarnings stop={stop} planStartDate={planStartDate} />
                                    <StateCard label={orderState.name} color={orderState.color ? orderState.color : "#363636ff"}/>
                                </div>
                            }
                        </div>
                        <div className="flex justify-between w-full items-center ">
                            <span className="truncate text-xs text-[var(--color-muted)] pr-1">
                                {streetAddress}
                            </span>
                            <div className="flex items-center justify-end gap-5 text-xs text-[var(--color-muted)]">
                                <div className="flex items-center gap-2">
                                    <ItemIcon className="h-3 w-3 app-icon" />
                                    <span>{itemCount}</span>
                                </div>
                                <div className="flex items-center gap-2 ">
                                    { expectedArrival ? 
                                        <>
                                            <TimeIcon className="h-3 w-3 app-icon" />
                                            <span className="whitespace-nowrap">
                                                    {expectedArrival}
                                            </span>
                                        </>
                                        : streetAddress 
                                            ? <LottieSpinner animation="sandClock" size={50} inline />
                                            : '--'
                                    }
                                </div>
                            </div>
                        </div>
                </div>
            </div>
                

            
        </div>
    );
}
