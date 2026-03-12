import { AnimatePresence, motion } from 'framer-motion'
import { AssignedRouteOverflowButton } from './AssignedRouteOverflowButton'
import { AssignedRouteOverflowMenu } from './AssignedRouteOverflowMenu'
import { AssignedRouteSearchField } from './AssignedRouteSearchField'
import { AssignedRouteToolbarMenuButton } from './AssignedRouteToolbarMenuButton'

type AssignedRouteToolbarProps = {
  isOverflowMenuOpen: boolean
  isSideMenuOpen: boolean
  searchValue: string
  showEmbeddedMenuButton: boolean
  onCloseOverflowMenu: () => void
  onOpenOverflowMenu: () => void
  onOpenSideMenu: () => void
  onSearchValueChange: (value: string) => void
}

const menuPresenceTransition = {
  duration: 0.4,
  ease: [0.22, 1, 0.36, 1] as const,
}

export function AssignedRouteToolbar({
  isOverflowMenuOpen,
  isSideMenuOpen,
  searchValue,
  showEmbeddedMenuButton,
  onCloseOverflowMenu,
  onOpenOverflowMenu,
  onOpenSideMenu,
  onSearchValueChange,
}: AssignedRouteToolbarProps) {
  return (
    <div className="sticky top-0 z-[1]  pb-2 pt-1">
      <div className={`route-toolbar-layout ${showEmbeddedMenuButton ? 'is-menu-visible' : ''}`}>
        <div className={`route-toolbar-menu-slot ${showEmbeddedMenuButton ? 'is-visible' : ''}`}>
          <AnimatePresence initial={false}>
            {showEmbeddedMenuButton ? (
              <motion.div
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 100 }}
                initial={{ opacity: 0, y: 100 }}
                key="toolbar-menu-button"
                transition={menuPresenceTransition}
              >
                <AssignedRouteToolbarMenuButton
                  isOpen={isSideMenuOpen}
                  onClick={onOpenSideMenu}
                />
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>

        <div className="min-w-0">
          <AssignedRouteSearchField
            onChange={onSearchValueChange}
            value={searchValue}
          />
        </div>

        <div className="relative flex-none">
          <AssignedRouteOverflowButton
            isOpen={isOverflowMenuOpen}
            onClick={isOverflowMenuOpen ? onCloseOverflowMenu : onOpenOverflowMenu}
          />

          <AssignedRouteOverflowMenu
            isOpen={isOverflowMenuOpen}
            onClose={onCloseOverflowMenu}
          />
        </div>
      </div>
    </div>
  )
}
