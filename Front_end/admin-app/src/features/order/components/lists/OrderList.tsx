import type { ReactElement, ReactNode, RefObject } from 'react'
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'

import type { Order } from '../../types/order'
import { DraggableOrderCard } from '../cards/DraggableOrderCard'
import { buildOrderAddressGroups } from '../../domain/orderAddressGroup.flow'
import { DraggableOrderAddressGroupCard } from '../cards/DraggableOrderAddressGroupCard'
import { useOrderGroupUIActions, useOrderGroupUIStore } from '../../store/orderGroupUI.store'

type OrderListProps = {
  orders: Order[]
  isSelectionMode?: boolean
  isOrderSelected?: (order: Order) => boolean
  onToggleSelection?: (order: Order) => void
  onEditOrder?: (order: Order) => void
  onOpenOrder?: (order: Order) => void
  onArchive?:(order:Order) => void
  onUnarchive?: (order: Order) => void
  hoveredClientId?: string | null
  onOrderMouseEnter?: (order: Order) => void
  onOrderMouseLeave?: () => void
  scrollContainerRef?: RefObject<HTMLElement | null>
}

type OrderRow = {
  key: string
  render: () => ReactElement | null
}

const DEFAULT_ROW_HEIGHT = 180
const OVERSCAN_PX = 700

const MeasuredOrderRow = ({
  top,
  onHeightChange,
  children,
}: {
  top: number
  onHeightChange: (height: number) => void
  children: ReactNode
}) => {
  const rowRef = useRef<HTMLDivElement | null>(null)

  useLayoutEffect(() => {
    const element = rowRef.current
    if (!element) return

    const measure = () => {
      onHeightChange(element.getBoundingClientRect().height)
    }

    measure()
    const observer = new ResizeObserver(() => measure())
    observer.observe(element)

    return () => {
      observer.disconnect()
    }
  }, [onHeightChange])

  return (
    <div
      ref={rowRef}
      className="absolute left-0 right-0 px-2"
      style={{ top }}
    >
      {children}
    </div>
  )
}

export const OrderList = ({
  orders,
  isSelectionMode = false,
  isOrderSelected,
  onToggleSelection,
  onOpenOrder,
  onArchive,
  onUnarchive,
  hoveredClientId,
  onOrderMouseEnter,
  onOrderMouseLeave,
  scrollContainerRef,
}: OrderListProps) => {
  const groups = useMemo(() => buildOrderAddressGroups(orders), [orders])
  const expandedGroupsByKey = useOrderGroupUIStore((state) => state.expandedGroupsByKey)
  const { toggleGroup } = useOrderGroupUIActions()
  const [scrollTop, setScrollTop] = useState(0)
  const [viewportHeight, setViewportHeight] = useState(0)
  const [measureVersion, setMeasureVersion] = useState(0)
  const heightMapRef = useRef(new Map<string, number>())

  const rows = useMemo<OrderRow[]>(() => groups.map((group) => {
    if (group.orders.length <= 1) {
      const order = group.orders[0]
      return {
        key: order?.client_id ?? group.key,
        render: () => {
          if (!order) return null
          return (
            <DraggableOrderCard
              key={order.client_id}
              order={order}
              onOpen={isSelectionMode ? undefined : onOpenOrder}
              onArchive={onArchive}
              onUnarchive={onUnarchive}
              isHovered={hoveredClientId === order.client_id}
              onMouseEnter={onOrderMouseEnter}
              onMouseLeave={onOrderMouseLeave}
              isSelectionMode={isSelectionMode}
              isSelected={isOrderSelected?.(order) ?? false}
              onToggleSelection={onToggleSelection}
            />
          )
        },
      }
    }

    const uiKey = `order:${group.key}`
    const expanded = expandedGroupsByKey[uiKey] ?? false
    const isGroupHovered = Boolean(
      hoveredClientId && group.orders.some((order) => order.client_id === hoveredClientId),
    )

    return {
      key: group.key,
      render: () => (
        <DraggableOrderAddressGroupCard
          key={group.key}
          group={group}
          expanded={expanded}
          isGroupHovered={isGroupHovered}
          onToggleExpanded={() => toggleGroup(uiKey)}
          isSelectionMode={isSelectionMode}
          isOrderSelected={isOrderSelected}
          onToggleSelection={onToggleSelection}
          onOpenOrder={onOpenOrder}
          onArchive={onArchive}
          onUnarchive={onUnarchive}
          hoveredClientId={hoveredClientId}
          onOrderMouseEnter={onOrderMouseEnter}
          onOrderMouseLeave={onOrderMouseLeave}
        />
      ),
    }
  }), [
    expandedGroupsByKey,
    groups,
    hoveredClientId,
    isOrderSelected,
    isSelectionMode,
    onArchive,
    onOpenOrder,
    onOrderMouseEnter,
    onOrderMouseLeave,
    onToggleSelection,
    onUnarchive,
    toggleGroup,
  ])

  useEffect(() => {
    const scrollElement = scrollContainerRef?.current
    if (!scrollElement) return

    const updateViewport = () => {
      setScrollTop(scrollElement.scrollTop)
      setViewportHeight(scrollElement.clientHeight)
    }

    updateViewport()
    scrollElement.addEventListener('scroll', updateViewport, { passive: true })
    const observer = new ResizeObserver(updateViewport)
    observer.observe(scrollElement)

    return () => {
      scrollElement.removeEventListener('scroll', updateViewport)
      observer.disconnect()
    }
  }, [scrollContainerRef])

  if (orders.length === 0) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <p className="text-gray-500">No orders found</p>
      </div>
    )
  }

  if (!scrollContainerRef?.current) {
    return (
      <div className="flex h-full flex-col gap-4 overflow-x-hidden px-2 pb-10 pt-4">
        {rows.map((row) => row.render())}
      </div>
    )
  }

  let runningTop = 0
  const layout = rows.map((row) => {
    const height = heightMapRef.current.get(row.key) ?? DEFAULT_ROW_HEIGHT
    const currentTop = runningTop
    runningTop += height + 16
    return {
      ...row,
      height,
      top: currentTop,
      bottom: runningTop,
    }
  })
  const totalHeight = Math.max(runningTop, viewportHeight)
  const visibleTop = Math.max(scrollTop - OVERSCAN_PX, 0)
  const visibleBottom = scrollTop + viewportHeight + OVERSCAN_PX
  const visibleRows = layout.filter((row) => row.bottom >= visibleTop && row.top <= visibleBottom)

  return (
    <div
      className="relative overflow-x-hidden px-2 pb-10 pt-4"
      style={{ height: totalHeight }}
      data-measure-version={measureVersion}
    >
      
      {visibleRows.map((row) => (
        <MeasuredOrderRow
          key={row.key}
          top={row.top}
          onHeightChange={(height) => {
            const roundedHeight = Math.ceil(height)
            if (heightMapRef.current.get(row.key) === roundedHeight) return
            heightMapRef.current.set(row.key, roundedHeight)
            setMeasureVersion((version) => version + 1)
          }}
        >
          {row.render()}
        </MeasuredOrderRow>
      ))}
    </div>
  )
}
