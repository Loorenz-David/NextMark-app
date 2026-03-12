import { useCallback, useMemo, useState, useSyncExternalStore } from 'react'
import { useDriverAppShell } from '@/app/shell/providers/driverAppShell.context'
import { selectBottomSheetState, selectSideMenuState } from '@/app/shell/stores/shell.selectors'

export function useAssignedRouteToolbarController() {
  const { store, closeSideMenu, openSideMenu } = useDriverAppShell()
  const [searchValue, setSearchValue] = useState('')
  const [isOverflowMenuOpen, setIsOverflowMenuOpen] = useState(false)

  const shellState = useSyncExternalStore(
    store.subscribe,
    store.getState,
    store.getState,
  )

  const bottomSheetState = useMemo(() => selectBottomSheetState(shellState), [shellState])
  const sideMenuState = useMemo(() => selectSideMenuState(shellState), [shellState])

  const handleSearchValueChange = useCallback((value: string) => {
    setSearchValue(value)
  }, [])

  const openSideMenuFromToolbar = useCallback(() => {
    if (sideMenuState.isOpen) {
      closeSideMenu()
      return
    }

    openSideMenu('menu-home', undefined)
  }, [closeSideMenu, openSideMenu, sideMenuState.isOpen])

  const openOverflowMenu = useCallback(() => {
    setIsOverflowMenuOpen(true)
  }, [])

  const closeOverflowMenu = useCallback(() => {
    setIsOverflowMenuOpen(false)
  }, [])

  return useMemo(() => ({
    searchValue,
    showEmbeddedMenuButton: bottomSheetState.snap === 'expanded',
    showShellHeaderMenuButton: bottomSheetState.snap !== 'expanded',
    isSideMenuOpen: sideMenuState.isOpen,
    isOverflowMenuOpen,
    onSearchValueChange: handleSearchValueChange,
    onOpenSideMenu: openSideMenuFromToolbar,
    onOpenOverflowMenu: openOverflowMenu,
    onCloseOverflowMenu: closeOverflowMenu,
  }), [
    bottomSheetState.snap,
    closeOverflowMenu,
    handleSearchValueChange,
    isOverflowMenuOpen,
    openOverflowMenu,
    openSideMenuFromToolbar,
    searchValue,
    sideMenuState.isOpen,
  ])
}
