import type { ReactNode } from 'react'
import { useCallback, useEffect, useMemo } from 'react'

import { DndContext, DragOverlay } from '@dnd-kit/core'

import { ResourcesManagerProvider } from '@/shared/resource-manager/ResourceManagerContext'
import { useMap } from '@/shared/map'
import { useMobile } from '@/app/contexts/MobileContext'

import { homeCollisionDetection } from '../dnd/collisionStrategies'
import type { PayloadBase } from '../types/types'
import { useBaseControlls } from '../hooks/useBaseControlls'
import { usePlanTypeDndController } from '../hooks/usePlanTypeDndController'
import { getPlanTypeProvider } from '../registry/planTypeProviders.map'
import { PlanTypeDragOverlay } from '../components/PlanTypeDragOverlay'

/**
 * Workspace-specific managers provider for route-operations.
 * Owns only workspace-local runtime state: DnD, map, base controls, and plan-type composition.
 * Global managers (popup, section) are provided by HomeAppManagersProvider at the home-app level.
 * Global notifications bridge is also at home-app level to support all workspace types.
 */
export function HomeRouteOperationsManagersProvider({ children }: { children: ReactNode }) {
  const { isMobile } = useMobile()
  const baseControlls = useBaseControlls<PayloadBase>()
  const ordersPlanType = baseControlls.payload?.ordersPlanType ?? null

  const mapManager = useMap()

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      // Popups are now owned by global manager, so no check for popupManager here.
      // Only handle section close for workspace-local interactions.
      if (event.key === 'Escape') {
        event.preventDefault()
      }
    },
    [],
  )

  useEffect(() => {
    if (!isMobile) {
      window.addEventListener('keydown', handleKeyDown)
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [handleKeyDown, isMobile])

  const dndController = usePlanTypeDndController(ordersPlanType)

  const {
    onDragStart,
    onDragOver,
    onDragEnd,
    onDragCancel,
    activeDrag,
    planDropFeedback,
    routeReorderPreview,
    sensors,
  } = dndController || {
    onDragStart: () => {},
    onDragOver: () => {},
    onDragEnd: () => {},
    onDragCancel: () => {},
    activeDrag: null,
    planDropFeedback: null,
    routeReorderPreview: null,
    sensors: [],
  }

  const PlanTypeProvider = getPlanTypeProvider(ordersPlanType)
  const planId = baseControlls.payload?.planId

  return (
    <ResourcesManagerProvider
      managers={{
        mapManager,
        baseControlls,
        planDropFeedback,
        routeReorderPreview,
      }}
    >
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
        {PlanTypeProvider && planId ? (
          <PlanTypeProvider planId={planId}>{children}</PlanTypeProvider>
        ) : (
          children
        )}

        <DragOverlay>
          <PlanTypeDragOverlay planType={ordersPlanType} activeDrag={activeDrag} />
        </DragOverlay>
      </DndContext>
    </ResourcesManagerProvider>
  )
}