export const DRIVER_SHELL_CONFIG = {
  bottomSheet: {
    snapHeights: {
      collapsed: 10,
      workspace: 45,
      expanded: 98,
    },
    interactionButtonsFadeOffsetPercent: 5,
    directionLockThresholdPx: 10,
    snapAnimationMs: 220,
    topRadiusPx: 28,
  },
  map: {
    overlapBehindSheetPx: 32,
    responsiveResizeThresholdPercent: 25,
  },
  sideMenu: {
    widthViewportPercent: 93,
    maxWidthPx: 420,
  },
} as const
