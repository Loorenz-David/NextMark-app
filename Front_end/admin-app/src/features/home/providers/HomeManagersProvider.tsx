import type { ComponentType, ReactNode } from 'react'
import { useCallback, useEffect, useMemo } from 'react'

import { DndContext, DragOverlay } from '@dnd-kit/core'


import { usePlanOrderDndController } from '@/features/plan/hooks/usePlanOrderDndController'
import type { StackComponentProps } from '@/shared/stack-manager/types'

import { ResourcesManagerProvider } from '@/shared/resource-manager/ResourceManagerContext'
import { AdminNotificationsActiveViewBridge } from '@/realtime/notifications'

import { useStackActionEntries } from '@/shared/stack-manager/useStackActionEntries'
import { StackActionManager } from '@/shared/stack-manager/StackActionManager'

import { useMap } from '@/shared/map'


import { OrderCard } from '@/features/order/components/cards/OrderCard'
import { OrderBatchDragOverlayCard } from '@/features/order/components/cards/OrderBatchDragOverlayCard'
import { OrderGroupDragOverlayCard } from '@/features/order/components/cards/OrderGroupDragOverlayCard'
import { RouteStopDragOverlay } from '@/features/plan/planTypes/localDelivery/components/overlays/RouteStopDragOverlay'
import { RouteStopGroupDragOverlay } from '@/features/plan/planTypes/localDelivery/components/overlays/RouteStopGroupDragOverlay'
import { homeCollisionDetection } from '@/features/home/dnd/collisionStrategies'

import type{ PayloadBase } from '../types/types'
import { useBaseControlls } from '../hooks/useBaseControlls'
import { homePopupRegistry } from '../registry/homePopups'
import { homeSectionRegistry } from '../registry/homeSections'
import { useMobile } from '@/app/contexts/MobileContext'

type ExtractPayload<T> = T extends ComponentType<StackComponentProps<infer P>>
  ? P
  : never

type HomePopupPayloads = {
  [K in keyof typeof homePopupRegistry]: ExtractPayload<(typeof homePopupRegistry)[K]>
}

type ManagerContextProps = {
    children: ReactNode

}

export function HomeManagersProvider({children}: ManagerContextProps) {
    const {isMobile} = useMobile()

    const popupManager = useMemo(
        () =>
        new StackActionManager<HomePopupPayloads>({
            stackRegistry: homePopupRegistry,
        }),
        [],
    )


    const sectionManager = useMemo(
        () =>
        new StackActionManager({
            stackRegistry: homeSectionRegistry,
        }),
        [],
    )

    const mapManager = useMap()

    const baseControlls = useBaseControlls<PayloadBase>()

    useStackActionEntries(popupManager)
    useStackActionEntries(sectionManager)

    const handleKeyDown = useCallback((event:KeyboardEvent)=>{

        if(popupManager.getOpenCount() > 0 ) return

        sectionManager.closeLastOnEsc(event)
    }, [popupManager, sectionManager])

    useEffect(()=>{
        if(!isMobile){
            window.addEventListener('keydown', handleKeyDown)
        }
        return () => {
            window.removeEventListener('keydown', handleKeyDown)
        }
    },[handleKeyDown, isMobile])

    const {
        onDragStart,
        onDragOver,
        onDragEnd,
        onDragCancel,
        activeDrag,
        planDropFeedback,
        routeReorderPreview,
        sensors,
    }  = usePlanOrderDndController()

    return (
       <ResourcesManagerProvider managers={{
            sectionManager,
            mapManager,
            popupManager,
            baseControlls,
            planDropFeedback,
            routeReorderPreview,
        }}>
            <AdminNotificationsActiveViewBridge />
                <DndContext
                    sensors={sensors}
                    collisionDetection={homeCollisionDetection}
                autoScroll={{
                    enabled: true,
                    threshold: { x: 0.1, y: 0.2 },
                    acceleration: 12,
                    interval: 8,
                }}
                onDragStart={onDragStart}
                onDragOver={onDragOver}
                onDragEnd={onDragEnd}
                onDragCancel={onDragCancel}
            >
                {children}

                <DragOverlay>
                    {activeDrag?.type === 'route_stop' ? (
                        <div className="pointer-events-none cursor-grabbing">
                            <RouteStopDragOverlay
                                routeStopClientId={activeDrag.routeStopClientId}
                                order={activeDrag.order}
                                stop={activeDrag.stop}
                                planStartDate={activeDrag.planStartDate}
                            />
                        </div>
                    ) : activeDrag?.type === 'order' ? (
                        <div className="pointer-events-none cursor-grabbing">
                            <OrderCard order={activeDrag.order} />
                        </div>
                    ) : activeDrag?.type === 'order_batch' ? (
                        <div className="pointer-events-none cursor-grabbing">
                            <OrderBatchDragOverlayCard
                                selectedCount={activeDrag.selectedCount}
                                isLoading={activeDrag.isLoading}
                            />
                        </div>
                    ) : activeDrag?.type === 'order_group' ? (
                        <div className="pointer-events-none cursor-grabbing">
                            <OrderGroupDragOverlayCard
                                count={activeDrag.count}
                                label={activeDrag.label}
                            />
                        </div>
                    ) : activeDrag?.type === 'route_stop_group' ? (
                        <div className="pointer-events-none cursor-grabbing">
                            <RouteStopGroupDragOverlay
                                count={activeDrag.count}
                                label={activeDrag.label}
                                firstStopOrder={activeDrag.firstStopOrder}
                                lastStopOrder={activeDrag.lastStopOrder}
                            />
                        </div>
                    ) : null}
                </DragOverlay>

                </DndContext>
       </ResourcesManagerProvider>
    )

}
