import { useCallback, useEffect, useRef, useState, type UIEvent } from 'react'

import { useMediaQuery } from '@/lib/utils/useMediaQuery'

type UseScrollHideActionBarParams = {
  enabled?: boolean
  expandedHeight: number
  collapsedHeight?: number
}

const DESKTOP_QUERY = '(min-width: 1000px)'
const NEAR_TOP_THRESHOLD = 28
const HIDE_SCROLL_TOP_THRESHOLD = 88
const HIDE_SCROLL_DELTA_THRESHOLD = 10
const SHOW_SCROLL_DELTA_THRESHOLD = 8
const MIN_SCROLL_DELTA = 3

export const useScrollHideActionBar = ({
  enabled = true,
  expandedHeight,
  collapsedHeight = 10,
}: UseScrollHideActionBarParams) => {
  const isDesktop = useMediaQuery(DESKTOP_QUERY)
  const isActive = enabled && isDesktop
  const [isActionBarVisible, setIsActionBarVisible] = useState(true)
  const lastScrollTopRef = useRef(0)

  useEffect(() => {
    if (!isActive) {
      setIsActionBarVisible(true)
      lastScrollTopRef.current = 0
    }
  }, [isActive])

  const handleScroll = useCallback(
    (event: UIEvent<HTMLDivElement>) => {
      if (!isActive) return

      const currentScrollTop = event.currentTarget.scrollTop
      const lastScrollTop = lastScrollTopRef.current
      const delta = currentScrollTop - lastScrollTop

      lastScrollTopRef.current = currentScrollTop

      if (currentScrollTop <= NEAR_TOP_THRESHOLD) {
        if (!isActionBarVisible) {
          setIsActionBarVisible(true)
        }
        return
      }

      if (Math.abs(delta) < MIN_SCROLL_DELTA) {
        return
      }

      if (
        delta > HIDE_SCROLL_DELTA_THRESHOLD &&
        currentScrollTop > HIDE_SCROLL_TOP_THRESHOLD &&
        isActionBarVisible
      ) {
        setIsActionBarVisible(false)
        return
      }

      if (delta < -SHOW_SCROLL_DELTA_THRESHOLD && !isActionBarVisible) {
        setIsActionBarVisible(true)
      }
    },
    [isActionBarVisible, isActive],
  )

  return {
    isActionBarVisible: isActive ? isActionBarVisible : true,
    actionBarReservedHeight: isActive
      ? isActionBarVisible
        ? expandedHeight
        : collapsedHeight
      : 0,
    isDesktopActionBarBehaviorEnabled: isActive,
    handleScroll,
  }
}
