import type { PropsWithChildren } from 'react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useDriverServices } from '@/app/providers/driverServices.context'
import type {
  BottomSheetPageId,
  BottomSheetMotionState,
  BottomSheetPageParamsMap,
  BottomSheetSnap,
  OverlayPageId,
  OverlayPageParamsMap,
  SlidingPagePageId,
  SlidingPagePageParamsMap,
  SideMenuPageId,
  SideMenuPageParamsMap,
} from '../domain/shell.types'
import { openBottomSheet as openBottomSheetAction } from '../actions/openBottomSheet.action'
import { pushBottomSheet as pushBottomSheetAction } from '../actions/pushBottomSheet.action'
import { openSideMenu as openSideMenuAction } from '../actions/openSideMenu.action'
import { closeSideMenu as closeSideMenuAction } from '../actions/closeSideMenu.action'
import { openSlidingPage as openSlidingPageAction } from '../actions/openSlidingPage.action'
import { closeSlidingPage as closeSlidingPageAction } from '../actions/closeSlidingPage.action'
import { openOverlay as openOverlayAction } from '../actions/openOverlay.action'
import { closeOverlay as closeOverlayAction } from '../actions/closeOverlay.action'
import { setBottomSheetSnap as setBottomSheetSnapAction } from '../actions/setBottomSheetSnap.action'
import { setBottomSheetHeight as setBottomSheetHeightAction } from '../actions/setBottomSheetHeight.action'
import { setBottomSheetMotionState as setBottomSheetMotionStateAction } from '../actions/setBottomSheetMotionState.action'
import { handleSurfaceBack as handleSurfaceBackAction } from '../actions/handleSurfaceBack.action'
import { createShellStore, createInitialShellStoreState } from '../stores/shell.store'
import { initializeDriverShellFlow } from '../flows/initializeDriverShell.flow'
import { DriverAppShellContext } from './driverAppShell.context'

export function DriverAppShellProvider({ children }: PropsWithChildren) {
  const { browserLocationService } = useDriverServices()
  const [store] = useState(() => createShellStore(createInitialShellStoreState()))

  const openBottomSheet = useCallback(<PageId extends BottomSheetPageId>(
    page: PageId,
    params: BottomSheetPageParamsMap[PageId],
  ) => {
    openBottomSheetAction(store, page, params)
  }, [store])

  const pushBottomSheet = useCallback(<PageId extends BottomSheetPageId>(
    page: PageId,
    params: BottomSheetPageParamsMap[PageId],
  ) => {
    pushBottomSheetAction(store, page, params)
  }, [store])

  const openSideMenu = useCallback(<PageId extends SideMenuPageId>(
    page: PageId,
    params: SideMenuPageParamsMap[PageId],
  ) => {
    openSideMenuAction(store, page, params)
  }, [store])

  const closeSideMenu = useCallback(() => {
    closeSideMenuAction(store)
  }, [store])

  const openSlidingPage = useCallback(<PageId extends SlidingPagePageId>(
    page: PageId,
    params: SlidingPagePageParamsMap[PageId],
  ) => {
    openSlidingPageAction(store, page, params)
  }, [store])

  const closeSlidingPage = useCallback(() => {
    closeSlidingPageAction(store)
  }, [store])

  const openOverlay = useCallback(<PageId extends OverlayPageId>(
    page: PageId,
    params: OverlayPageParamsMap[PageId],
  ) => {
    openOverlayAction(store, page, params)
  }, [store])

  const closeOverlay = useCallback(() => {
    closeOverlayAction(store)
  }, [store])

  const setBottomSheetSnap = useCallback((snap: BottomSheetSnap) => {
    setBottomSheetSnapAction(store, snap)
  }, [store])

  const setBottomSheetHeight = useCallback((percent: number) => {
    setBottomSheetHeightAction(store, percent)
  }, [store])

  const setBottomSheetMotionState = useCallback((motionState: BottomSheetMotionState) => {
    setBottomSheetMotionStateAction(store, motionState)
  }, [store])

  const handleSurfaceBack = useCallback(() => handleSurfaceBackAction(store), [store])

  useEffect(() => {
    void initializeDriverShellFlow({
      browserLocationService,
      store,
    })
  }, [browserLocationService, store])

  const value = useMemo(() => ({
    store,
    openBottomSheet,
    pushBottomSheet,
    openSideMenu,
    closeSideMenu,
    openSlidingPage,
    closeSlidingPage,
    openOverlay,
    closeOverlay,
    setBottomSheetSnap,
    setBottomSheetHeight,
    setBottomSheetMotionState,
    handleSurfaceBack,
  }), [
    closeOverlay,
    closeSlidingPage,
    closeSideMenu,
    handleSurfaceBack,
    openBottomSheet,
    openOverlay,
    openSideMenu,
    openSlidingPage,
    pushBottomSheet,
    setBottomSheetHeight,
    setBottomSheetMotionState,
    setBottomSheetSnap,
    store,
  ])

  return <DriverAppShellContext.Provider value={value}>{children}</DriverAppShellContext.Provider>
}
