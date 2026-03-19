import { useRef, useEffect, type RefObject, type CSSProperties } from 'react'
import { useNavigate } from 'react-router-dom'
import { BasicButton } from '@/shared/buttons/BasicButton'
import { useSectionManager, useMapManager, usePopupManager } from '@/shared/resource-manager/useResourceManager'

import { ArchiveIcon, ChevronDownIcon, SettingIcon } from '@/assets/icons'

import { OrderPage } from '@/features/order/pages/order.page'
import { OrderMapOverlay } from '@/features/order/components/OrderMapOverlay'
import { LocalDeliveryMapOverlay } from '@/features/plan/planTypes/localDelivery/components'
import { useBaseControlls } from '@/shared/resource-manager/useResourceManager'
import { useMapSelectionModeGuardFlow } from '@/features/home/flows/mapSelectionModeGuard.flow'
import { useHomeDesktopKeyboardFlow } from '@/features/home/flows/homeDesktopKeyboard.flow'
import { useHomeDesktopRailSettleFlow } from '@/features/home/flows/homeDesktopRailSettle.flow'
import { useHomeDesktopDerivedStateFlow } from '@/features/home/flows/homeDesktopDerivedState.flow'

import { HomeDesktopLayout } from '../layout/HomeDesktopLayout'
import { useHomeDesktopLayout } from '../hooks/useHomeDesktopLayout'
import { SectionManagerHost } from '../components/SectionManagerHost'
import type { PayloadBase } from '../types/types'
import { AdminNotificationsTrigger } from '@/realtime/notifications'

import { SectionPanel } from '../../../shared/section-panel/SectionPanel'
import { PlanDesktopShell } from '@/features/plan/views/PlanDesktopShell'
import { useOrderCaseActions } from '@/features/orderCase/actions/orderCase.actions'

const SAFE_GUTTER = 24
const DEFAULT_VIEWPORT_INSETS = {
  top: SAFE_GUTTER,
  right: SAFE_GUTTER,
  bottom: SAFE_GUTTER,
  left: SAFE_GUTTER,
}

const MAP_CONTAINER_STYLE: CSSProperties = {
  height: '100%',
  width: '100%',
  position: 'absolute',
  zIndex: 0,
  top: '0',
  left: '0',
}

const PLAN_TOGGLE_BUTTON_STYLE: CSSProperties = {
  padding: '29px 6px',
  backgroundColor: 'var(--color-page)',
  borderRadius: '10px 0 0 10px',
  border: '1px solid #8a8a8a9c',
}
const PLAN_TOGGLE_BUTTON_SPLIT_STYLE: CSSProperties = {
  padding: '6px 29px ',
  backgroundColor: 'var(--color-page)',
  borderBottom:'2px solid var(--color-page)',
  borderRadius: '15px 15px 0 0',
  border: '1px solid #8a8a8a9c',
}

export function HomeDesktopView() {
  const mapContainerRef = useRef<HTMLDivElement | null>(null)
  const headerRef = useRef<HTMLDivElement | null>(null)

  const { initialize, resize, setViewportInsets, reframeToVisibleArea } = useMapManager()
  const sectionManager = useSectionManager()
  const popupManager = usePopupManager()
  const baseControlls = useBaseControlls<PayloadBase>()

  const derivedState = useHomeDesktopDerivedStateFlow({ sectionManager, baseControlls })
  const layout = useHomeDesktopLayout({ openSectionsCount: derivedState.openSectionsCount })

  useEffect(() => {
    void initialize(mapContainerRef.current)
  }, [initialize])

  useMapSelectionModeGuardFlow()

  useEffect(() => {
    setViewportInsets(DEFAULT_VIEWPORT_INSETS)
  }, [setViewportInsets])

  const { handleRailLayoutChange, handleRailTransitionEnd } = useHomeDesktopRailSettleFlow({
    layoutDeps: {
      viewMode: layout.viewMode,
      planColumnWidth: layout.planColumnWidth,
      mapRowHeight: layout.mapRowHeight,
      planRowHeight: layout.planRowHeight,
      hasOverlay: layout.hasOverlay,
      isPlanVisible: layout.isPlanVisible,
    },
    resize,
    reframeToVisibleArea,
  })

  useHomeDesktopKeyboardFlow({
    isEnabled: true,
    isPopupOpen: popupManager.getOpenCount() > 0,
    onTogglePlan: layout.togglePlan,
    closeAllSections: () => sectionManager.closeAll(),
  })

  const SelectedOrdersPlanType = derivedState.SelectedOrdersPlanType
  const splitMode = layout.viewMode === 'split'

  return (
    <>
      <HomeDesktopHeader
        headerRef={headerRef}
        viewMode={layout.viewMode}
        onToggleViewMode={layout.toggleViewMode}
      />

      <HomeDesktopLayout
        viewMode={layout.viewMode}
        splitMode={splitMode}
        planColumnWidth={layout.planColumnWidth}
        mapRowHeight={layout.mapRowHeight}
        planRowHeight={layout.planRowHeight}
        overlayWidth={layout.overlayWidth}
        hasOverlay={layout.hasOverlay}
        onPlanLayoutChange={handleRailLayoutChange}
        onRailTransitionEnd={handleRailTransitionEnd}
        map={<div ref={mapContainerRef} style={MAP_CONTAINER_STYLE} />}
        mapOverlay={
          derivedState.isLocalDeliveryOverlayActive ? <LocalDeliveryMapOverlay /> : <OrderMapOverlay />
        }
        plan={<PlanDesktopShell onRequestClose={layout.closePlan} viewMode={layout.viewMode} />}
        base={
          <div style={{ width: layout.baseWidth, height: '100%', overflowX: 'hidden' }}>
            <SectionPanel style={{ width: layout.planWidth }} parentParams={{ borderLeft: '#8a8a8a5b' }}>
              <OrderPage />
            </SectionPanel>
          </div>
        }
        orderOverlay={
          baseControlls.isBaseOpen ? (
            <SectionPanel onRequestClose={baseControlls.closeBase} style={{ width: layout.planWidth }}>
              {SelectedOrdersPlanType && <SelectedOrdersPlanType payload={baseControlls.payload} />}
            </SectionPanel>
          ) : null
        }
        overlay={
          <SectionManagerHost
            stackKey="dynamicSectionPanels"
            isBaseOpen={baseControlls.isBaseOpen}
            width={layout.overlayWidth}
          />
        }
        buttonTogglePlan={
          layout.canTogglePlan ? (
            <BasicButton
              params={{
                onClick: layout.togglePlan,
                variant: 'ghost',
                ariaLabel: 'Toggle delivery plan',
                style: splitMode ?  PLAN_TOGGLE_BUTTON_SPLIT_STYLE : PLAN_TOGGLE_BUTTON_STYLE,
              }}
            >
              <ChevronDownIcon 
                className={`w-5 h-5  text-[var(--color-muted)] transition-transform 
                  ${splitMode 
                    ? layout.isPlanVisible 
                          ? ''
                          : 'rotate-180'
                    
                    : 'rotate-90'}
                  ` }
              />
            </BasicButton>
          ) : null
        }
        isPlanVisible={layout.isPlanVisible}
      />
    </>
  )
}

function HomeDesktopHeader({
  headerRef,
  viewMode,
  onToggleViewMode,
}: {
  headerRef?: RefObject<HTMLDivElement | null>
  viewMode: 'rail' | 'split'
  onToggleViewMode: () => void
}) {
  const navigate = useNavigate()
  const { openCaseMain } = useOrderCaseActions()

  return (
    <div
      ref={headerRef}
      className="flex h-14 w-full items-center justify-between border-b border-b-1 border-b-[var(--color-muted)]/50 px-4"
    >
      <div className="flex items-center"></div>
      <div className="flex items-center gap-5 scale-95">
        <BasicButton
          params={{
            variant: 'secondary',
            ariaLabel: 'Toggle plan view mode',
            className: 'border-[var(--color-muted)]/30',
            onClick: onToggleViewMode,
          }}
        >
          {viewMode === 'rail' ? 'Split View' : 'Rail View'}
        </BasicButton>
        <BasicButton
          params={{
            variant: 'secondary',
            ariaLabel: 'Cases',
            className: 'border-[var(--color-muted)]/30',
            onClick: openCaseMain,
          }}
        >
          <ArchiveIcon className="mr-2 h-4 w-4" />
          Cases
        </BasicButton>
        <AdminNotificationsTrigger />
        <BasicButton
          params={{
            variant: 'secondary',
            ariaLabel: 'Settings',
            className: 'border-[var(--color-muted)]/30',
            onClick: () => navigate('/settings'),
          }}
        >
          <SettingIcon className="mr-2 h-4 w-4 " />
          Settings
        </BasicButton>
       
      </div>
    </div>
  )
}
