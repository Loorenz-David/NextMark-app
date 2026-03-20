import { useCallback, useEffect, useState, type PointerEvent as ReactPointerEvent } from 'react'

import {
  clampFloatingPoint,
  readPersistedLayout,
  readViewport,
  resolveDefaultLauncherPosition,
  resolveDefaultPanelPosition,
  writePersistedLayout,
} from '../layout'
import type { FloatingPoint, FloatingSize, FloatingViewport } from '../layout'

export type DragTarget = 'panel' | 'launcher'

type DragState = {
  target: DragTarget
  startPointer: FloatingPoint
  startPosition: FloatingPoint
}

interface UseAiPanelLayoutStateParams {
  storageKey: string
  viewportMargin: number
  mobileBreakpoint: number
  desktopSize: FloatingSize
  launcherSize: FloatingSize
  defaultOpen: boolean
}

interface AiPanelLayoutState {
  viewport: FloatingViewport
  isMobile: boolean
  isOpen: boolean
  setIsOpen: (next: boolean | ((current: boolean) => boolean)) => void
  panelPosition: FloatingPoint
  launcherPosition: FloatingPoint
  startDrag: (target: DragTarget) => (event: ReactPointerEvent<HTMLElement>) => void
}

export function useAiPanelLayoutState({
  storageKey,
  viewportMargin,
  mobileBreakpoint,
  desktopSize,
  launcherSize,
  defaultOpen,
}: UseAiPanelLayoutStateParams): AiPanelLayoutState {
  const initialViewport = readViewport()
  const persistedLayout = readPersistedLayout(storageKey)
  const initialPanelPosition = clampFloatingPoint(
    persistedLayout?.panelPosition ?? resolveDefaultPanelPosition(initialViewport, desktopSize, viewportMargin),
    desktopSize,
    initialViewport,
    viewportMargin,
  )
  const initialLauncherPosition = clampFloatingPoint(
    persistedLayout?.launcherPosition ??
      resolveDefaultLauncherPosition(initialViewport, launcherSize, viewportMargin),
    launcherSize,
    initialViewport,
    viewportMargin,
  )

  const [viewport, setViewport] = useState(initialViewport)
  const [isOpen, setIsOpen] = useState(Boolean(persistedLayout?.isOpen ?? defaultOpen))
  const [panelPosition, setPanelPosition] = useState(initialPanelPosition)
  const [launcherPosition, setLauncherPosition] = useState(initialLauncherPosition)
  const [dragState, setDragState] = useState<DragState | null>(null)

  const isMobile = viewport.width < mobileBreakpoint

  useEffect(() => {
    const handleResize = () => {
      const nextViewport = readViewport()
      setViewport(nextViewport)
      setPanelPosition((current) =>
        clampFloatingPoint(current, desktopSize, nextViewport, viewportMargin),
      )
      setLauncherPosition((current) =>
        clampFloatingPoint(current, launcherSize, nextViewport, viewportMargin),
      )
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [desktopSize, launcherSize, viewportMargin])

  useEffect(() => {
    if (!dragState || isMobile) {
      return
    }

    const handlePointerMove = (event: PointerEvent) => {
      const deltaX = event.clientX - dragState.startPointer.x
      const deltaY = event.clientY - dragState.startPointer.y
      const size = dragState.target === 'panel' ? desktopSize : launcherSize
      const nextPoint = clampFloatingPoint(
        {
          x: dragState.startPosition.x + deltaX,
          y: dragState.startPosition.y + deltaY,
        },
        size,
        viewport,
        viewportMargin,
      )

      if (dragState.target === 'panel') {
        setPanelPosition(nextPoint)
        return
      }

      setLauncherPosition(nextPoint)
    }

    const handlePointerUp = () => {
      setDragState(null)
    }

    window.addEventListener('pointermove', handlePointerMove)
    window.addEventListener('pointerup', handlePointerUp)

    return () => {
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerup', handlePointerUp)
    }
  }, [desktopSize, dragState, isMobile, launcherSize, viewport, viewportMargin])

  useEffect(() => {
    writePersistedLayout(storageKey, {
      isOpen,
      panelPosition,
      launcherPosition,
    })
  }, [isOpen, launcherPosition, panelPosition, storageKey])

  const startDrag = useCallback(
    (target: DragTarget) => (event: ReactPointerEvent<HTMLElement>) => {
      if (isMobile) {
        return
      }

      event.preventDefault()
      setDragState({
        target,
        startPointer: { x: event.clientX, y: event.clientY },
        startPosition: target === 'panel' ? panelPosition : launcherPosition,
      })
    },
    [isMobile, launcherPosition, panelPosition],
  )

  return {
    viewport,
    isMobile,
    isOpen,
    setIsOpen,
    panelPosition,
    launcherPosition,
    startDrag,
  }
}
