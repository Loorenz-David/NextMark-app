import { useEffect } from 'react'
import { useMobile } from '@/app/contexts/MobileContext'
import { useBaseControlls } from '@/shared/resource-manager/useResourceManager'
import { BasicButton } from '@/shared/buttons/BasicButton'
import { ArchiveIcon } from '@/assets/icons'
import { useOrderCaseActions } from '@/features/orderCase/actions/orderCase.actions'
import { useHomeApp } from '@/features/home-app/providers/HomeAppProvider'

import { HomeOverlays } from '../components/HomeOverlays'
import { HomeDesktopView } from '../views/HomeDesktopView'
import { HomeMobileView } from '../views/HomeMobileView'
import type { PayloadBase } from '../types/types'
import { HomeRouteOperationsManagersProvider } from '../providers/HomeRouteOperationsManagersProvider'

export const HomeRouteOperationsPage = () => {
  return (
    <HomeRouteOperationsManagersProvider>
      <RouteOperationsHeaderActionsRegistrar />
      <HomeRouteOperationsContent />
    </HomeRouteOperationsManagersProvider>
  )
}

const HomeRouteOperationsContent = () => {
  const { isMobile } = useMobile()
  const baseControlls = useBaseControlls<PayloadBase>()
  const disableAuroraBackground =
    baseControlls.isBaseOpen && baseControlls.payload?.ordersPlanType === 'local_delivery'

  return (
    <div className="admin-app-shell h-full overflow-hidden bg-[var(--color-page)] text-[var(--color-text)]">
      {!disableAuroraBackground ? (
        <>
          <div className="admin-shell-aurora admin-shell-aurora--one" />
          <div className="admin-shell-aurora admin-shell-aurora--two" />
          <div className="admin-shell-aurora admin-shell-aurora--three" />
        </>
      ) : null}
      <HomeOverlays />
      <div className="relative z-10 flex h-full w-full flex-col overflow-hidden">
        {isMobile ? <HomeMobileView /> : <HomeDesktopView />}
      </div>
    </div>
  )
}

const RouteOperationsHeaderActionsRegistrar = () => {
  const { openCaseMain } = useOrderCaseActions()
  const { setHeaderActions } = useHomeApp()

  useEffect(() => {
    setHeaderActions(
      <BasicButton
        params={{
          variant: 'toolbarSecondary',
          ariaLabel: 'Cases',
          className: 'border-[var(--color-muted)]/24 px-4 py-[5px]',
          onClick: openCaseMain,
        }}
      >
        <ArchiveIcon className="mr-2 h-4 w-4" />
        Cases
      </BasicButton>,
    )

    return () => {
      setHeaderActions(null)
    }
  }, [openCaseMain, setHeaderActions])

  return null
}
