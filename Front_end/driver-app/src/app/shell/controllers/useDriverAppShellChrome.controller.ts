import { useMemo, useSyncExternalStore } from 'react'
import { useDriverServices } from '@/app/providers/driverServices.context'
import { useConnectivity } from '@/app/providers/connectivity.context'
import { useSession } from '@/app/providers/session.context'
import { useWorkspace } from '@/app/providers/workspace.context'
import { useRouteExecutionShell } from '@/features/route-execution/providers/routeExecutionShell.context'
import { locateCurrentLocationAction } from '../actions/locateCurrentLocation.action'
import { useDriverAppShell } from '../providers/driverAppShell.context'
import {
  selectMapSurfaceState,
  selectSurfaceFocus,
  selectBottomSheetState,
  selectOverlayState,
  selectSideMenuState,
  selectSlidingPageState,
} from '../stores/shell.selectors'

export function useDriverAppShellChromeController() {
  const { browserLocationService } = useDriverServices()
  const { isOnline } = useConnectivity()
  const { clearSession } = useSession()
  const { workspace } = useWorkspace()
  const { closeRouteSearch, routeViewMode } = useRouteExecutionShell()
  const {
    store,
    openSideMenu,
    closeSideMenu,
    openOverlay,
    closeOverlay,
    handleSurfaceBack,
  } = useDriverAppShell()

  const shellState = useSyncExternalStore(
    store.subscribe,
    store.getState,
    store.getState,
  )

  const bottomSheetState = useMemo(() => selectBottomSheetState(shellState), [shellState])
  const sideMenuState = useMemo(() => selectSideMenuState(shellState), [shellState])
  const slidingPageState = useMemo(() => selectSlidingPageState(shellState), [shellState])
  const overlayState = useMemo(() => selectOverlayState(shellState), [shellState])
  const mapSurfaceState = useMemo(() => selectMapSurfaceState(shellState), [shellState])
  const surfaceFocus = useMemo(() => selectSurfaceFocus(shellState), [shellState])

  return useMemo(() => ({
    workspace,
    isOnline,
    surfaceFocus,
    canGoBack:
      overlayState.isOpen
      || slidingPageState.isOpen
      || sideMenuState.isOpen
      || bottomSheetState.canPop
      || bottomSheetState.snap !== 'workspace',
    isSideMenuOpen: sideMenuState.isOpen,
    openMenu: () => openSideMenu('menu-home', undefined),
    closeMenu: closeSideMenu,
    openShellHelp: () => openOverlay('shell-overlay-placeholder', {
      title: 'Driver Shell',
      message: 'OverlaySurface is live and blocks lower-surface interaction. Route execution remains the first bottom-sheet workspace.',
    }),
    showHeaderMenuButton: bottomSheetState.snap !== 'expanded',
    locateCurrentLocation: async () => locateCurrentLocationAction({
      browserLocationService,
      store,
    }),
    isLocatingCurrentLocation: mapSurfaceState.currentLocationStatus === 'locating',
    closeShellHelp: closeOverlay,
    handleBack: () => {
      if (routeViewMode === 'search') {
        closeRouteSearch()
        return true
      }

      return handleSurfaceBack()
    },
    clearSession,
  }), [
    browserLocationService,
    bottomSheetState.canPop,
    bottomSheetState.snap,
    clearSession,
    closeOverlay,
    closeRouteSearch,
    closeSideMenu,
    handleSurfaceBack,
    isOnline,
    mapSurfaceState.currentLocationStatus,
    openOverlay,
    openSideMenu,
    overlayState.isOpen,
    routeViewMode,
    sideMenuState.isOpen,
    slidingPageState.isOpen,
    store,
    surfaceFocus,
    workspace,
  ])
}
