import { useEffect } from 'react'
import type { CSSProperties } from 'react'
import { BottomSheetSurface } from './BottomSheetSurface'
import { MapSurface } from './MapSurface'
import { OverlaySurface } from './OverlaySurface'
import { SideMenuSurface } from './SideMenuSurface'
import { SlidingPageSurface } from './SlidingPageSurface'
import { MenuButton } from './MenuButton'
import { DRIVER_SHELL_CONFIG } from '../domain/shell.config'
import { useDriverAppShellChromeController } from '../controllers/useDriverAppShellChrome.controller'
import './driverAppShell.css'

export function DriverAppShell() {
  const controller = useDriverAppShellChromeController()
  const shellStyle = {
    '--driver-bottom-sheet-radius': `${DRIVER_SHELL_CONFIG.bottomSheet.topRadiusPx}px`,
    '--driver-bottom-sheet-snap-ms': `${DRIVER_SHELL_CONFIG.bottomSheet.snapAnimationMs}ms`,
    '--driver-side-menu-width': `min(${DRIVER_SHELL_CONFIG.sideMenu.widthViewportPercent}vw, ${DRIVER_SHELL_CONFIG.sideMenu.maxWidthPx}px)`,
  } as CSSProperties

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') {
        return
      }

      if (controller.canGoBack) {
        controller.handleBack()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [controller])

  return (
    <div className="driver-shell" style={shellStyle}>
      <MapSurface />

      <header className="driver-shell__topbar">
        {controller.showHeaderMenuButton ? (
          <MenuButton
            isOpen={controller.isSideMenuOpen}
            onClick={controller.isSideMenuOpen ? controller.closeMenu : controller.openMenu}
            mode={'onMap'}
          />
        ) : null}
      </header>

      <BottomSheetSurface />
      <SideMenuSurface />
      <SlidingPageSurface />
      <OverlaySurface />
    </div>
  )
}
