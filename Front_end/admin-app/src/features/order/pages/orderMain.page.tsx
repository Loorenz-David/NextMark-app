import type { RefObject } from 'react'
import { useRef } from 'react'

import type { StackComponentProps } from '@/shared/stack-manager/types'
import { BasicButton } from '@/shared/buttons/BasicButton'

import { OrderMainHeader } from '../components/pageHeaders/OrderMainHeader'
import { OrderList } from '../components/lists/OrderList'
import { OrderProvider } from '../context/OrderProvider'
import { useOrderContext } from '../context/OrderContext'
import type { Order } from '../types/order'

const OrderMainContent = ({ scrollContainerRef }: { scrollContainerRef: RefObject<HTMLDivElement | null> }) => {
  const {
    orders,
    orderActions,
    orderSelectionActions,
    isSelectionMode,
    isOrderSelected,
    query,
    orderStats,
    hoveredClientId,
    handleOrderRowMouseEnter,
    handleOrderRowMouseLeave,
    currentPage,
    hasMorePages,
    isLoadingNextPage,
    loadNextPage,
  } = useOrderContext()

  const handleOpenOrder = (order: Order) => {
    orderActions.openOrderDetail(
      { clientId: order.client_id, mode: 'view' },
      {pageClass:'bg-[var(--color-muted)]/10 ', borderLeft:'rgb(var(--color-light-blue-r),0.7)'}
    )
  }

  return (
    <div className="flex h-full w-full flex-col bg-[var(--color-primary)]/5">
      <OrderMainHeader 
        onCreate={() => orderActions.openOrderForm({ mode: 'create' })}
        onEnterSelectionMode={orderSelectionActions.handleEnterSelectionMode}
        onExitSelectionMode={orderSelectionActions.handleExitSelectionMode}
        onSelectAllFiltered={orderSelectionActions.handleSelectAllFiltered}
        onClearSelection={orderSelectionActions.handleClearSelection}
        isSelectionMode={isSelectionMode}
        applySearch={orderActions.applySearch}
        applyFilters={orderActions.applyFilters}
        query={query}
        updateFilters={orderActions.updateFilters}
        deleteFilter={orderActions.deleteFilter}
        orderStats={orderStats}

      />
      <div ref={scrollContainerRef} className="flex-1 overflow-y-auto scroll-thin ">
        <OrderList
          orders={orders}
          scrollContainerRef={scrollContainerRef}
          isSelectionMode={isSelectionMode}
          isOrderSelected={isOrderSelected}
          onToggleSelection={orderSelectionActions.handleToggleOrderSelection}
          onOpenOrder={handleOpenOrder}
          onArchive={orderActions.handleArchiveOrder}
          onUnarchive={orderActions.handleUnarchiveOrder}
          hoveredClientId={hoveredClientId}
          onOrderMouseEnter={handleOrderRowMouseEnter}
          onOrderMouseLeave={handleOrderRowMouseLeave}
        />
        <div className="flex justify-center pb-6 pt-2">
          <BasicButton
            params={{
              onClick: () => { void loadNextPage() },
              disabled: isLoadingNextPage || !hasMorePages,
              variant: 'secondary',
              ariaLabel: 'Load next page of orders',
            }}
          >
            {isLoadingNextPage ? 'Loading…' : hasMorePages ? `Next Page (${currentPage + 1})` : 'No more orders'}
          </BasicButton>
        </div>
      </div>
    </div>
  )
}

export const OrderMainPage = (_: StackComponentProps<undefined>) => {
  const scrollContainerRef = useRef<HTMLDivElement | null>(null)

  return (
    <OrderProvider scrollContainerRef={scrollContainerRef}>
      <OrderMainContent scrollContainerRef={scrollContainerRef} />
    </OrderProvider>
  )
}
