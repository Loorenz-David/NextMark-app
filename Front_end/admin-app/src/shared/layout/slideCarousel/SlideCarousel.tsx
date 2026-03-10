import { Children, useMemo, useState } from 'react'


import { SlideCarouselDots } from './SlideCarouselDots'
import type { SlideCarouselProps } from './types'
import { BoldArrowIcon } from '@/assets/icons'

export const SlideCarousel = ({ children, initialIndex = 0 }: SlideCarouselProps) => {
  const slides = useMemo(() => Children.toArray(children), [children])
  const total = slides.length

  const safeInitialIndex = total > 0 ? Math.max(0, Math.min(initialIndex, total - 1)) : 0
  const [index, setIndex] = useState(safeInitialIndex)

  const next = () => {
    setIndex((prev) => Math.min(prev + 1, total - 1))
  }

  const prev = () => {
    setIndex((prev) => Math.max(prev - 1, 0))
  }

  return (
    <div className="relative flex h-full w-full flex-col">
      <div className="relative flex min-h-0 flex-1 overflow-hidden">
        <div
          className="flex h-full w-full transition-transform duration-300 ease-out"
          style={{ transform: `translateX(-${index * 100}%)` }}
        >
          {slides.map((child, childIndex) => (
            <div key={childIndex} className="w-full flex-shrink-0">
              {child}
            </div>
          ))}
        </div>

        
      </div>

        <div className="flex w-full items-center gap-1">
          <div className="flex flex-2 justify-end">
            {index > 0 ? (
              <button
                type="button"
                onClick={prev}
                className=" p-2 shadow-md cursor-pointer rounded-full  "

                aria-label="Previous slide"
              >
                <BoldArrowIcon className="h-3 w-3 rotate-180"/>
              </button>
            ) : null}
          </div>
          <div className="flex flex-1 justify-center">
              <SlideCarouselDots index={index} total={total} />
          </div>
          <div className="flex flex-2 justify-start">
            {index < total - 1 ? (
            <button
              type="button"
              onClick={next}
              className=" bg-white p-2 shadow-md cursor-pointer rounded-full"

              aria-label="Next slide"
            >
              <BoldArrowIcon className="h-3 w-3 "/>
              
            </button>
          ) : null}
          </div>
          
        </div>
      
    </div>
  )
}

