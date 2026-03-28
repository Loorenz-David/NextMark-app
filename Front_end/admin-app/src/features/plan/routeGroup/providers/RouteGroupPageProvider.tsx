import type { ReactNode } from 'react'
import { useMemo } from 'react'

import { useRouteGroupPageInitializationFlow } from '../flows/routeGroupPageInitialization.flow'
import { useRouteGroupPageEscapeFlow } from '../flows/routeGroupPageEscape.flow'
import { useRouteGroupPageResourcesController } from '../controllers/useRouteGroupPageResources.controller'
import { useRouteGroupPageCommandsController } from '../controllers/useRouteGroupPageCommands.controller'
import { useSyncActiveRouteGroupSelectionFlow } from '../flows/syncActiveRouteGroupSelection.flow'
import { useSyncActiveRouteSolutionSelectionFlow } from '../flows/syncActiveRouteSolutionSelection.flow'

import {
  RouteGroupPageCommandsContext,
  RouteGroupPageStateContext,
  type RouteGroupPageCommandsContextValue,
  type RouteGroupPageStateContextValue,
} from '../context/RouteGroupPage.context'
import { useMobile } from '@/app/contexts/MobileContext'
import { useBaseControlls, usePopupManager, useSectionManager } from '@/shared/resource-manager/useResourceManager'
import type { PayloadBase } from '@/features/home-route-operations/types/types'

type RouteGroupPageProviderProps = {
  planId: number | null
  freshAfter?: string | null
  children: ReactNode
}

export function RouteGroupPageProvider({
  planId,
  freshAfter,
  children,
}: RouteGroupPageProviderProps) {
  const { isMobile } = useMobile()
  const sectionManager = useSectionManager()
  const popupManager = usePopupManager()
  const baseControls = useBaseControlls<PayloadBase>()
  const {
    plan,
    planState,
    planStartDate,
    routeGroups,
    activeRouteGroupId,
    routeGroup,
    orders,
    orderCount,
    routeGroupId,
    routeSolutions,
    routeSolutionsOrdered,
    selectedRouteSolution,
    routeSolutionId,
    routeSolutionStops,
    bestRouteSolutionId,
    isSelectedSolutionOptimized,
    stopByOrderId,
    ordersById,
    boundaryLocations,
    storedSelectedRouteSolutionId,
    loadingController,
    routeSolutionWarningRegistry,
  } = useRouteGroupPageResourcesController(planId)

  useSyncActiveRouteGroupSelectionFlow({
    planId,
    routeGroups,
    activeRouteGroupId,
  })
  useSyncActiveRouteSolutionSelectionFlow({
    routeGroupId: routeGroupId,
    routeSolutions,
    storedSelectedRouteSolutionId,
    fallbackRouteSolutionId: routeSolutionId,
  })

  const { routeGroupPageActions, loadingController: commandLoadingController } = useRouteGroupPageCommandsController({
    routeGroupId,
    planId: plan?.id ?? planId,
    plan: plan ?? null,
    routeGroup: routeGroup ?? null,
    selectedRouteSolution: selectedRouteSolution ?? null,
    isSelectedSolutionOptimized,
    loadingController,
  })

  useRouteGroupPageInitializationFlow(
    planId,
    freshAfter ?? baseControls.payload?.freshAfter ?? null,
  )
  useRouteGroupPageEscapeFlow({
    isMobile,
    baseControls,
    popupManager,
    sectionManager,
  })
  
  const stateValue = useMemo<RouteGroupPageStateContextValue>(
    () => ({
      planId,
      plan: plan ?? null,
      planState,
      routeGroups,
      routeGroup: routeGroup ?? null,
      routeGroupId,
      planStartDate,
      orders,
      orderCount,
      stopByOrderId,
      ordersById,
      selectedRouteSolution: selectedRouteSolution ?? null,
      routeSolutionsOrdered,
      bestRouteSolutionId,
      isSelectedSolutionOptimized,
      routeSolutionId,
      routeSolutionStops,
      boundaryLocations,
      routeSolutionWarningRegistry,
    }),
    [
      planId,
      plan,
      planState,
      routeGroups,
      routeGroup,
      routeGroupId,
      planStartDate,
      orders,
      orderCount,
      stopByOrderId,
      ordersById,
      selectedRouteSolution,
      routeSolutionsOrdered,
      bestRouteSolutionId,
      isSelectedSolutionOptimized,
      routeSolutionId,
      routeSolutionStops,
      boundaryLocations,
      routeSolutionWarningRegistry,
    ],
  )

  const commandsValue = useMemo<RouteGroupPageCommandsContextValue>(
    () => ({
      routeGroupPageActions,
      loadingController: commandLoadingController,
    }),
    [
      routeGroupPageActions,
      commandLoadingController,
    ],
  )

  return (
    <RouteGroupPageStateContext.Provider value={stateValue}>
      <RouteGroupPageCommandsContext.Provider value={commandsValue}>
        {children}
      </RouteGroupPageCommandsContext.Provider>
    </RouteGroupPageStateContext.Provider>
  )
}
