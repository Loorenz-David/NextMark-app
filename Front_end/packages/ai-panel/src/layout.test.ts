import {
  clampFloatingPoint,
  resolveDefaultLauncherPosition,
  resolveDefaultPanelPosition,
} from './layout'

const assert = (condition: boolean, message: string) => {
  if (!condition) {
    throw new Error(message)
  }
}

export const runAiPanelLayoutTests = () => {
  const viewport = { width: 1280, height: 720 }

  {
    const point = clampFloatingPoint({ x: -20, y: 999 }, { width: 320, height: 240 }, viewport, 24)
    assert(point.x === 24, 'panel x should clamp to the left margin')
    assert(point.y === 456, 'panel y should clamp inside the viewport')
  }

  {
    const point = resolveDefaultPanelPosition(viewport, { width: 420, height: 600 }, 24)
    assert(point.x === 836, 'default panel should anchor near the right edge')
    assert(point.y >= 24, 'default panel should stay inside the top margin')
  }

  {
    const point = resolveDefaultLauncherPosition(viewport, { width: 68, height: 68 }, 24)
    assert(point.x === 1188, 'default launcher should anchor near the right edge')
    assert(point.y === 628, 'default launcher should anchor near the bottom edge')
  }
}
