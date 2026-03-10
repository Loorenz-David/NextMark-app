import { useCallback, useState } from 'react'

import { usePopupManager, useSectionManager } from '@/shared/resource-manager/useResourceManager'
import { deleteQueryFilter, resetQuery, setQueryFilters, setQuerySearch, updateQueryFilters, useOrderQuery } from '../store/orderQuery.store'
import type { OrderQueryFilters, OrderQueryStringQueries } from "../types/orderMeta";
import { filterBehavior, orderStringFilters, resolveConflicts } from '../domain/orderFilterConfig'
import type { Order } from '../types/order';
import { useOrderController } from '../controllers/order.controller';

type openOrderDetailProps ={ 
  clientId?: string; 
  serverId?: number; 
  mode?: 'view' | 'edit' 
}
type parentParamsProps ={
  borderLeft?:string
  pageClass?:string
}


export const useOrderActions = () => {


  const popupManager = usePopupManager()
  const sectionManager = useSectionManager()
  const query = useOrderQuery()
  const { archiveOrder, unarchiveOrder } = useOrderController()
  
  const handleArchiveOrder = useCallback(
    (order:Order)=>{
        archiveOrder( order.client_id, order.id )
    },
    [archiveOrder]
  )

  const handleUnarchiveOrder = useCallback(
    (order: Order) => {
      unarchiveOrder(order.client_id, order.id)
    },
    [unarchiveOrder]
  )
  const openOrderForm = useCallback(
    (payload?: { clientId?: string; mode?: 'create' | 'edit'; deliveryPlanId?: number | null }) => {

      popupManager.open({ key: 'order.edit', payload:{...payload, controllBodyLayout:true} })
    },
    [popupManager],
  )
  const openOrderCases = useCallback(
    (payload: { orderId?: number, orderReference:string })=>{
      sectionManager.open({key:'orderCase.orderCases', payload, parentParams:{ borderLeft:'rgb(var(--color-turques-r),0.7)'}})
    },
    []
  )
  const openOrderDetail = useCallback(
    (payload: openOrderDetailProps, parentParams:parentParamsProps) => {
      const key = 'order.details'

      const openPayload = sectionManager.getEntryPayload(key) as openOrderDetailProps | undefined
      if(openPayload && openPayload?.clientId == payload?.clientId){
        return
      }

      
      sectionManager.open({ key: key, payload , parentParams:parentParams})
    },
    [sectionManager],
  )

  const applySearch = useCallback(
    (input: string) => {
      const trimmed = input.trim()
      setQuerySearch(trimmed)
    },
    []
  )
  const applyFilters = useCallback(
    (filters: OrderQueryFilters) => {
      setQueryFilters(filters)
    },
    []
  )
  const resetFilters = useCallback(() => {
    resetQuery()

  }, [])

  const updateFilters = useCallback(
    (key: OrderQueryStringQueries, value: unknown) => {

      if (key in filterBehavior){
        const updatedFilters = resolveConflicts(query.filters, key)
        applyFilters({...updatedFilters, [key]:value})
        return
      }
      
     

      if (orderStringFilters.has(key)) {
        const previous = query.filters.s ?? []
        const alreadySelected = previous.includes(key as OrderQueryStringQueries)
        if (alreadySelected) return

        updateQueryFilters({ s: [ ...(query.filters.s || []), key as OrderQueryStringQueries] })
        return
      } 
      updateQueryFilters({ [key]: value })
    },
    [query, ]
  )
  const deleteFilter = useCallback(
    (key:OrderQueryStringQueries) => {
        
        if (orderStringFilters.has(key)) { 
         
          const newStringFilters = (query.filters.s || []).filter(f => f !== key)

          updateQueryFilters({ s: newStringFilters })
          return
        }
      deleteQueryFilter(key as keyof OrderQueryFilters)
    },
    [query]
  )

  const handleOrderMarkerClick = useCallback(
      (_event: MouseEvent, order: Order) => {
        openOrderDetail(
          { clientId: order.client_id, mode: 'view' },
          {
            pageClass: 'bg-[var(--color-muted)]/10 ',
            borderLeft: 'rgb(var(--color-light-blue-r),0.7)',
          },
        )
      },
      [],
    )

  return {
    openOrderForm,
    openOrderDetail,
    applySearch,
    applyFilters,
    resetFilters,
    updateFilters,
    deleteFilter,
    openOrderCases,
    handleArchiveOrder,
    handleUnarchiveOrder,
    handleOrderMarkerClick
  }
}

