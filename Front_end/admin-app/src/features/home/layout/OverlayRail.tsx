import type { ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

interface OverlayRailProps {
  base: ReactNode
  overlay: ReactNode
  orderOverlay?: ReactNode
  hasOverlay: boolean
  overlayWidth: number
  onPlanLayoutChange?: () => void
}

export function OverlayRail({
  base,
  overlay,
  orderOverlay,
  hasOverlay,
  overlayWidth,
  onPlanLayoutChange,
}: OverlayRailProps) {
  return (
    <div className="relative z-30 h-full shrink-0">
      {base}

      <AnimatePresence mode="sync">
        {orderOverlay && (
          <motion.div
            className="absolute inset-1 z-39 h-full w-full"
            key="for overlay"
            initial={{ x: 450 }}
            animate={{ x: 0 }}
            exit={{ x: 450 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            {orderOverlay}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="sync">
        {hasOverlay && (
          <motion.div
            className="absolute inset-0 z-40 h-full w-full"
            key="with-order"
            initial={{ x: overlayWidth }}
            animate={{ x: 0 }}
            exit={{ x: overlayWidth }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            {overlay}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
