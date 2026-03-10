import { useCallback, useState } from 'react'

import { planIconTypeMap } from "@/features/plan/utils/planIconTypeMap"
import { SectionHeader } from "@/shared/section-panel/SectionHeader"
import { BasicButton } from "@/shared/buttons"
import { CsvIcon, EditIcon, PdfIcon, PlusIcon, RetryIcon } from "@/assets/icons"
import { RouteOptimizationDropdownButton } from "../RouteOptimizationDropdownButton"
import { ThreeDotMenu } from "@/shared/buttons/ThreeDotMenu"
import { OrderImportButton } from "@/features/order/components/OrderImportButton"
import type { OrderImportControls } from "@/features/order/components/OrderImportButton"
import { useLocalDeliveryCommands, useLocalDeliveryState } from '../../context/useLocalDeliveryContext'

export const MainHeaderLocalDeliveryPage = ()=>{
    const { localDeliveryActions } = useLocalDeliveryCommands()
    const { plan, localDeliveryPlan, orderCount, selectedRouteSolution } = useLocalDeliveryState()


    const [importControls, setImportControls] = useState<OrderImportControls>({
        triggerFileInput: () => undefined,
        loading: false,
        disabled: true,
    })
    const handleImportReady = useCallback((controls: OrderImportControls) => {
        setImportControls(controls)
    }, [])

    const PlanTypeIcon = planIconTypeMap.local_delivery
    const title = plan?.label ?? 'undefined plan'

    const hasRouteWarnings = selectedRouteSolution?.has_route_warnings
    const isNotOptimize = selectedRouteSolution?.is_optimized == 'not optimize'
    const isLoading = localDeliveryPlan?.is_loading
    
    return (
        <>
           
            <SectionHeader
                title={
                     <div className="flex flex-col ">
                        <span>
                            {title}
                        </span>
                        <p className="text-[11px] text-[var(--color-muted)] font-normal">
                            {plan?.total_orders ?? 0 } orders • {plan?.total_items ?? 0 } items • {plan?.total_volume?.toFixed(2) ?? 0 } ㎥ • {plan?.total_weight?.toFixed(2) ?? 0 } kg
                        </p>

                    </div>
                }
                icon={<PlanTypeIcon className="h-6 w-6 text-[var(--color-muted)]" />}
                closeButton
            />
            {!isLoading 
                ? <div className="flex flex-col gap-4 w-full px-5 py-3  "
                    key="heade-local-delivery-button"
                    >
                            <div className="flex gap-4  w-full">
                                <BasicButton
                                    params={{ variant: 'primary', onClick: localDeliveryActions.handleCreateOrder, ariaLabel: 'Create Delivery order' }}
                                >
                                    <PlusIcon className="w-4 h-4 mr-2 stroke-[var(--color-secondary)]" />
                                    Order
                                </BasicButton>
                                <BasicButton
                                    params={{ variant: 'secondary', onClick: localDeliveryActions.handleEditLocalPlan, ariaLabel: 'Edit local delivery plan' }}
                                >
                                    <EditIcon className="w-4 h-4 mr-2 stroke-[var(--color-secondary)]" />
                                    Edit
                                </BasicButton>
                                {/* <BasicButton
                                    params={{ variant: 'secondary', onClick: localDeliveryActions.handleOpenRouteStats, ariaLabel: 'display stats of route solution' }}
                                >
                                    <StatsIcon className="w-4 h-4 mr-2 stroke-[var(--color-secondary)]" />
                                    Stats
                                </BasicButton> */}
                            
                                <ThreeDotMenu 
                                    dotWidth={3}
                                    dotHeight={3}
                                    dotClassName={'bg-[var(--color-muted)]'}
                                    triggerClassName={' p-2 w-5 rounded-full bg-[var(--color-page)] border border-[var(--color-border)] shadow-sm ml-auto  cursor-pointer'}
                                    options={[
                                        {label:'Update optimization', action:localDeliveryActions.optimizeRoute, icon:<RetryIcon className="h-4 w-4"/>},
                                        {label:'Download route', action: localDeliveryActions.handlePrintRouteSolution, icon:<PdfIcon className="h-6 w-6"/>},
                                        {
                                            label: importControls.loading ? 'Importing orders...' : 'Import orders (CSV)',
                                            action: importControls.triggerFileInput,
                                            icon:<CsvIcon className="h-4 w-4"/>,
                                            disabled: importControls.disabled,
                                        },
                                        // {label:'Send messages', action: ()=>{}}
                                    ]}
                                />
                                
                            </div>
                            {orderCount > 0 && (isNotOptimize || hasRouteWarnings) &&
                                <div className="flex flex-1">
                                    <RouteOptimizationDropdownButton
                                    borderColor="var(--color-blue-300)"
                                    className="w-full"
                                    />
                                </div>
                            }
                    </div>
                : null
            }
            <OrderImportButton planId={plan?.id} onReady={handleImportReady} />
        </>
    )
}
