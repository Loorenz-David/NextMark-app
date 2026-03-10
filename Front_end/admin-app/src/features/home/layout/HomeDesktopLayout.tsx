import type { ReactNode } from 'react'

import type { DesktopPlanViewMode } from '../hooks/useHomeDesktopLayout'
import { MapArea } from './MapArea'
import { OverlayRail } from './OverlayRail'
import { PlanArea } from './PlanArea'

interface HomeDesktopLayoutProps {
  map: ReactNode
  mapOverlay?: ReactNode
  plan?: ReactNode
  base: ReactNode
  overlay: ReactNode
  orderOverlay?: ReactNode
  buttonTogglePlan?: ReactNode
  isPlanVisible: boolean
  viewMode: DesktopPlanViewMode
  splitMode: boolean
  planColumnWidth: number
  mapRowHeight: number
  planRowHeight: number
  overlayWidth: number
  hasOverlay: boolean
  onPlanLayoutChange?: () => void
  onRailTransitionEnd?: () => void
}

export function HomeDesktopLayout({
  map,
  mapOverlay,
  plan,
  base,
  overlay,
  orderOverlay,
  buttonTogglePlan,
  isPlanVisible,
  viewMode,
  splitMode,
  planColumnWidth,
  mapRowHeight,
  planRowHeight,
  overlayWidth,
  hasOverlay,
  onPlanLayoutChange,
  onRailTransitionEnd,
}: HomeDesktopLayoutProps) {


  return (
    <main className="flex flex-1 overflow-hidden">
      <div className="flex h-full min-w-0 flex-1 flex-col">
        <div
          className={splitMode ? 'relative min-h-0 shrink-0 layout-animate' : 'relative min-h-0 flex-1'}
          style={
            splitMode
              ? {
                  height: `${mapRowHeight}%`,
                  willChange: 'height',
                  transition: 'height 220ms cubic-bezier(0.22, 1, 0.36, 1)',
                }
              : { height: '100%' }
          }
          onTransitionEnd={(event) => {
            if (!splitMode) return
            if (event.propertyName !== 'height') return
            onRailTransitionEnd?.()
          }}
        >
          <MapArea map={map} mapOverlay={mapOverlay} />
        </div>

        {splitMode ? (
          <PlanArea
            viewMode={viewMode}
            isPlanVisible={isPlanVisible}
            plan={plan}
            buttonTogglePlan={buttonTogglePlan}
            planColumnWidth={planColumnWidth}
            planRowHeight={planRowHeight}
            onPlanLayoutChange={onPlanLayoutChange}
            onRailTransitionEnd={onRailTransitionEnd}
          />
        ) : null}
      </div>

      {!splitMode ? (
        <PlanArea
          viewMode={viewMode}
          isPlanVisible={isPlanVisible}
          plan={plan}
          buttonTogglePlan={buttonTogglePlan}
          planColumnWidth={planColumnWidth}
          planRowHeight={planRowHeight}
          onPlanLayoutChange={onPlanLayoutChange}
          onRailTransitionEnd={onRailTransitionEnd}
        />
      ) : null}

      <OverlayRail
        base={base}
        overlay={overlay}
        orderOverlay={orderOverlay}
        hasOverlay={hasOverlay}
        overlayWidth={overlayWidth}
        onPlanLayoutChange={onPlanLayoutChange}
      />
    </main>
  )
}
