import type { UIEvent } from 'react'

import { RouteGroupOrderList, RouteGroupsActionBar } from '../components'
import { OptimizationLoading } from '../components/spinners/Optimization.spinner'
import { MIN_LOADER_VISIBLE_MS } from '../constants/optimization.constants'
import { useRouteGroupPageContext } from '../context/useRouteGroupPageContext'
import { useRouteGroupActionBarVisibility } from '../hooks/useRouteGroupActionBarVisibility'

type RouteGroupsPageContentProps = {
  showOptimizeRow: boolean
}

const ACTION_BAR_HEIGHT_WITH_OPTIMIZE = 138
const ACTION_BAR_HEIGHT_WITHOUT_OPTIMIZE = 82
const ACTION_BAR_COLLAPSED_HEIGHT = 12

export const RouteGroupsPageContent = ({
  showOptimizeRow,
}: RouteGroupsPageContentProps) => {
  const { orderCount, routeGroup } = useRouteGroupPageContext()

  const isLoading = routeGroup?.is_loading
  const optimizationStartedAt = routeGroup?.optimization_started_at ?? null
  const {
    isActionBarVisible,
    actionBarReservedHeight,
    isDesktopActionBarBehaviorEnabled,
    handleScroll,
  } = useRouteGroupActionBarVisibility({
    enabled: !isLoading,
    expandedHeight: showOptimizeRow
      ? ACTION_BAR_HEIGHT_WITH_OPTIMIZE
      : ACTION_BAR_HEIGHT_WITHOUT_OPTIMIZE,
    collapsedHeight: ACTION_BAR_COLLAPSED_HEIGHT,
  })

  return (
    <div className="relative flex h-full w-full flex-col bg-[var(--color-primary)]/5">
      <RouteGroupsActionBar
        useFloatingActionBar={isDesktopActionBarBehaviorEnabled}
        isActionBarVisible={isActionBarVisible}
        showOptimizeRow={showOptimizeRow}
      />
      {!isLoading 
        ? (
          <RouteGroupOrderList
            onScrollContainer={handleScroll}
            topReservedOffset={isDesktopActionBarBehaviorEnabled ? actionBarReservedHeight : 0}
          />
        )
        : isLoading == 'isOptimizing' 
          ? <OptimizationLoading message={
            <>
              <p className="font-semibold text-[var(--color-muted)]">
                Optimization in progress
              </p>
              <p className="text-sm opacity-70">
                You can come back when it is ready.
              </p>
            </>
          } startedAt={optimizationStartedAt} orderCount={orderCount} minDurationMs={MIN_LOADER_VISIBLE_MS} />
          : null
      }

    </div>
  )
}
