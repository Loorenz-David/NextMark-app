import { useMemo, useState } from 'react'

import { ChevronDownIcon } from '@/assets/icons'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils/cn'

import type { LocalDeliveryGaussianMetricCard } from './LocalDeliveryStatsOverlay.types'

type GaussianMetricCardProps = {
  card: LocalDeliveryGaussianMetricCard
}

const TRACK_PATH = 'M 18 112 A 62 62 0 0 1 142 112'

export const GaussianMetricCard = ({ card }: GaussianMetricCardProps) => {
  const [activeIndex, setActiveIndex] = useState(0)
  const activeFace = useMemo(
    () => card.faces[activeIndex] ?? card.faces[0],
    [activeIndex, card.faces],
  )

  const handleToggle = () => {
    if (card.faces.length <= 1) return
    setActiveIndex((current) => (current + 1) % card.faces.length)
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      className="pointer-events-auto relative flex min-h-[150px] w-full flex-col rounded-2xl border border-white/45 bg-black/28 p-4 pt-3 text-left text-sm text-white backdrop-blur-md transition-colors hover:bg-black/34"
    >
      <ChevronDownIcon className="-rotate-90 absolute right-3 top-[10px] h-4 w-4 text-white/70" />

      <div className="flex gap-1 pr-6">
        {card.faces.map((face, index) => (
          <button
            key={face.id}
            type="button"
            onClick={(event) => {
              event.stopPropagation()
              setActiveIndex(index)
            }}
            aria-label={`Show ${face.label}`}
            className={cn(
              'h-[1px] flex-1 rounded-full transition-colors',
              index === activeIndex ? 'bg-white/92' : 'bg-white/24 hover:bg-white/40',
            )}
          />
        ))}
      </div>

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={activeFace.id}
          initial={{ opacity: 0, x: 18 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -18 }}
          transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
          className="flex h-full flex-col gap-2"
        >
          <div className="relative flex items-start justify-center pt-4">
            <div className="relative h-[60px] w-[150px]">
              <svg
                viewBox="0 50 160 60"
                className="h-full w-full overflow-visible"
                aria-hidden="true"
              >
                <path
                  d={TRACK_PATH}
                  fill="none"
                  stroke="rgba(255,255,255,0.88)"
                  strokeWidth="12"
                  strokeLinecap="round"
                  pathLength={100}
                />
                <motion.path
                  d={TRACK_PATH}
                  fill="none"
                  strokeLinecap="round"
                  strokeWidth="12"
                  pathLength={100}
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: Math.max(0, Math.min(100, activeFace.progressValue)) / 100 }}
                  transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                  className={cn('stroke-lime-400', activeFace.accentClassName)}
                />
              </svg>

              <div className="pointer-events-none absolute inset-x-0 bottom-[5px] flex items-end justify-center px-7">
                <span className="text-center text-sm font-semibold leading-tight text-white">
                  {activeFace.displayValue} 
                </span>
              </div>
            </div>
          </div>

          <div className="  flex justify-center">
            <div className="text-xs font-semibold text-white text-center">{activeFace.label}</div>
          </div>
        </motion.div>
      </AnimatePresence>
    </button>
  )
}
