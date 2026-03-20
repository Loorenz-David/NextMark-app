export interface FloatingPoint {
  x: number
  y: number
}

export interface FloatingSize {
  width: number
  height: number
}

export interface FloatingViewport {
  width: number
  height: number
}

export interface PersistedAiPanelLayout {
  isOpen: boolean
  panelPosition: FloatingPoint
  launcherPosition: FloatingPoint
}

export function readViewport(): FloatingViewport {
  if (typeof window === 'undefined') {
    return { width: 1440, height: 900 }
  }

  return {
    width: window.innerWidth,
    height: window.innerHeight,
  }
}

export function clampFloatingPoint(
  point: FloatingPoint,
  size: FloatingSize,
  viewport: FloatingViewport,
  margin: number,
): FloatingPoint {
  const maxX = Math.max(margin, viewport.width - size.width - margin)
  const maxY = Math.max(margin, viewport.height - size.height - margin)

  return {
    x: Math.min(Math.max(point.x, margin), maxX),
    y: Math.min(Math.max(point.y, margin), maxY),
  }
}

export function resolveDefaultPanelPosition(
  viewport: FloatingViewport,
  size: FloatingSize,
  margin: number,
): FloatingPoint {
  return clampFloatingPoint(
    {
      x: viewport.width - size.width - margin,
      y: Math.max(margin, Math.round(viewport.height * 0.08)),
    },
    size,
    viewport,
    margin,
  )
}

export function resolveDefaultLauncherPosition(
  viewport: FloatingViewport,
  size: FloatingSize,
  margin: number,
): FloatingPoint {
  return clampFloatingPoint(
    {
      x: viewport.width - size.width - margin,
      y: viewport.height - size.height - margin,
    },
    size,
    viewport,
    margin,
  )
}

export function readPersistedLayout(storageKey: string): Partial<PersistedAiPanelLayout> | null {
  if (typeof window === 'undefined') {
    return null
  }

  const raw = window.localStorage.getItem(storageKey)
  if (!raw) {
    return null
  }

  try {
    const parsed = JSON.parse(raw) as Partial<PersistedAiPanelLayout>
    return parsed && typeof parsed === 'object' ? parsed : null
  } catch {
    return null
  }
}

export function writePersistedLayout(storageKey: string, layout: PersistedAiPanelLayout): void {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(storageKey, JSON.stringify(layout))
}
