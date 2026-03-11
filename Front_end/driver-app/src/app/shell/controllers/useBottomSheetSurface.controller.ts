import { useCallback, useMemo, useRef, useSyncExternalStore } from 'react'
import type { PointerEvent as ReactPointerEvent } from 'react'
import { DRIVER_SHELL_CONFIG } from '../domain/shell.config'
import { useDriverAppShell } from '../providers/driverAppShell.context'
import { selectBottomSheetState } from '../stores/shell.selectors'

const SNAP_STEPS = [
  { snap: 'collapsed', percent: DRIVER_SHELL_CONFIG.bottomSheet.snapHeights.collapsed },
  { snap: 'workspace', percent: DRIVER_SHELL_CONFIG.bottomSheet.snapHeights.workspace },
  { snap: 'expanded', percent: DRIVER_SHELL_CONFIG.bottomSheet.snapHeights.expanded },
] as const

const DIRECTION_LOCK_THRESHOLD_PX = DRIVER_SHELL_CONFIG.bottomSheet.directionLockThresholdPx
const SNAP_ANIMATION_MS = DRIVER_SHELL_CONFIG.bottomSheet.snapAnimationMs

type DragDirection = 'up' | 'down' | null

export function useBottomSheetSurfaceController() {
  const {
    store,
    setBottomSheetHeight,
    setBottomSheetMotionState,
    setBottomSheetSnap,
  } = useDriverAppShell()

  const shellState = useSyncExternalStore(
    store.subscribe,
    store.getState,
    store.getState,
  )

  const bottomSheetState = useMemo(() => selectBottomSheetState(shellState), [shellState])
  const interactionButtonsThreshold =
    DRIVER_SHELL_CONFIG.bottomSheet.snapHeights.workspace
    + DRIVER_SHELL_CONFIG.bottomSheet.interactionButtonsFadeOffsetPercent

  const dragStateRef = useRef<{
    pointerId: number
    startY: number
    startPercent: number
    lastClientY: number
    direction: DragDirection
  } | null>(null)
  const snapAnimationTimeoutRef = useRef<number | null>(null)

  const clearSnapAnimationTimeout = useCallback(() => {
    if (snapAnimationTimeoutRef.current !== null) {
      window.clearTimeout(snapAnimationTimeoutRef.current)
      snapAnimationTimeoutRef.current = null
    }
  }, [])

  const updateHeightFromPointer = useCallback((clientY: number) => {
    if (!dragStateRef.current) {
      return
    }

    const deltaY = dragStateRef.current.startY - clientY
    const viewportHeight = window.innerHeight || 1
    const deltaPercent = (deltaY / viewportHeight) * 100
    setBottomSheetHeight(dragStateRef.current.startPercent + deltaPercent)
  }, [setBottomSheetHeight])

  const commitNearestSnap = useCallback((dragDirection: DragDirection) => {
    const currentPercent = bottomSheetState.heightPercent

    if (dragDirection === 'up') {
      const upwardStep = SNAP_STEPS.find((step) => step.percent >= currentPercent) ?? SNAP_STEPS.at(-1) ?? SNAP_STEPS[0]
      setBottomSheetSnap(upwardStep.snap)
      return
    }

    if (dragDirection === 'down') {
      const downwardSteps = [...SNAP_STEPS].reverse()
      const downwardStep = downwardSteps.find((step) => step.percent <= currentPercent) ?? SNAP_STEPS[0]
      setBottomSheetSnap(downwardStep.snap)
      return
    }

    const nearest = SNAP_STEPS.reduce((closest, step) => (
      Math.abs(step.percent - currentPercent) < Math.abs(closest.percent - currentPercent)
        ? step
        : closest
    ), SNAP_STEPS[0])

    setBottomSheetSnap(nearest.snap)
  }, [bottomSheetState.heightPercent, setBottomSheetSnap])

  const handlePointerDown = useCallback((event: ReactPointerEvent<HTMLButtonElement>) => {
    clearSnapAnimationTimeout()
    setBottomSheetMotionState('dragging')

    dragStateRef.current = {
      pointerId: event.pointerId,
      startY: event.clientY,
      startPercent: bottomSheetState.heightPercent,
      lastClientY: event.clientY,
      direction: null,
    }

    event.currentTarget.setPointerCapture(event.pointerId)
  }, [bottomSheetState.heightPercent, clearSnapAnimationTimeout, setBottomSheetMotionState])

  const handlePointerMove = useCallback((event: ReactPointerEvent<HTMLButtonElement>) => {
    if (!dragStateRef.current || dragStateRef.current.pointerId !== event.pointerId) {
      return
    }

    const movementDelta = dragStateRef.current.lastClientY - event.clientY
    if (Math.abs(movementDelta) >= DIRECTION_LOCK_THRESHOLD_PX) {
      dragStateRef.current.direction = movementDelta > 0 ? 'up' : 'down'
    }
    dragStateRef.current.lastClientY = event.clientY

    updateHeightFromPointer(event.clientY)
  }, [updateHeightFromPointer])

  const handlePointerUp = useCallback((event: ReactPointerEvent<HTMLButtonElement>) => {
    if (!dragStateRef.current || dragStateRef.current.pointerId !== event.pointerId) {
      return
    }

    const dragDirection = dragStateRef.current.direction
    event.currentTarget.releasePointerCapture(event.pointerId)
    dragStateRef.current = null
    setBottomSheetMotionState('snapping')
    commitNearestSnap(dragDirection)
    snapAnimationTimeoutRef.current = window.setTimeout(() => {
      setBottomSheetMotionState('idle')
      snapAnimationTimeoutRef.current = null
    }, SNAP_ANIMATION_MS)
  }, [commitNearestSnap, setBottomSheetMotionState])

  const handlePointerCancel = useCallback((event: ReactPointerEvent<HTMLButtonElement>) => {
    if (!dragStateRef.current || dragStateRef.current.pointerId !== event.pointerId) {
      return
    }

    event.currentTarget.releasePointerCapture(event.pointerId)
    dragStateRef.current = null
    setBottomSheetMotionState('idle')
  }, [setBottomSheetMotionState])

  return useMemo(() => ({
    ...bottomSheetState,
    showInteractionButtons: bottomSheetState.heightPercent <= interactionButtonsThreshold,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    handlePointerCancel,
  }), [
    bottomSheetState,
    handlePointerCancel,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    interactionButtonsThreshold,
  ])
}
