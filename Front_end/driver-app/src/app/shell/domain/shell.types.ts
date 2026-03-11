import type { Coordinates } from '@/shared/map'
import { DRIVER_SHELL_CONFIG } from './shell.config'

export type ShellSurface = 'bottom-sheet' | 'side-menu' | 'overlay'
export type BottomSheetSnap = 'collapsed' | 'workspace' | 'expanded'
export type ShellSurfaceFocus = 'bottom-sheet' | 'side-menu' | 'overlay'
export type BottomSheetMotionState = 'idle' | 'dragging' | 'snapping'

export type BottomSheetPageId =
  | 'route-workspace'
  | 'route-stop-detail'

export type SideMenuPageId = 'menu-home'

export type OverlayPageId = 'shell-overlay-placeholder'

export type BottomSheetPageParamsMap = {
  'route-workspace': undefined
  'route-stop-detail': { stopClientId: string }
}

export type SideMenuPageParamsMap = {
  'menu-home': undefined
}

export type OverlayPageParamsMap = {
  'shell-overlay-placeholder': { title: string; message: string }
}

type StackEntryBase<PageId extends string, Params> = {
  key: string
  page: PageId
  params: Params
}

export type BottomSheetStackEntry = {
  [PageId in BottomSheetPageId]: StackEntryBase<PageId, BottomSheetPageParamsMap[PageId]>
}[BottomSheetPageId]

export type SideMenuStackEntry = {
  [PageId in SideMenuPageId]: StackEntryBase<PageId, SideMenuPageParamsMap[PageId]>
}[SideMenuPageId]

export type OverlayStackEntry = {
  [PageId in OverlayPageId]: StackEntryBase<PageId, OverlayPageParamsMap[PageId]>
}[OverlayPageId]

export type ShellStoreState = {
  bottomSheetStack: BottomSheetStackEntry[]
  sideMenuStack: SideMenuStackEntry[]
  overlayStack: OverlayStackEntry[]
  bottomSheetSnap: BottomSheetSnap
  bottomSheetHeightPercent: number
  bottomSheetMotionState: BottomSheetMotionState
  currentLocation: Coordinates | null
  currentLocationFocusRequestKey: number
  currentLocationStatus: 'idle' | 'locating' | 'ready' | 'error'
  currentLocationError: string | null
  surfaceFocus: ShellSurfaceFocus
}

export type ShellStore = ReturnType<typeof import('../stores/shell.store').createShellStore>

export const BOTTOM_SHEET_HEIGHTS: Record<BottomSheetSnap, number> = {
  collapsed: DRIVER_SHELL_CONFIG.bottomSheet.snapHeights.collapsed,
  workspace: DRIVER_SHELL_CONFIG.bottomSheet.snapHeights.workspace,
  expanded: DRIVER_SHELL_CONFIG.bottomSheet.snapHeights.expanded,
}

export function createStackKey(page: string) {
  return `${page}:${globalThis.crypto?.randomUUID?.() ?? `${Date.now()}:${Math.random().toString(16).slice(2)}`}`
}
