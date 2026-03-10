import { formatPhone } from '@/shared/data-validation/phoneValidation'
import { StateCard } from '@/shared/layout/StateCard'
import { useEffect, useState } from 'react'

import type { Order } from '../types/order'
import type { OrderState } from '../types/orderState'
import { AccordionSection } from '@/shared/layout/AccordionSection'
import type { PropsWithChildren } from 'react'
import { formatIsoDate, formatIsoDateFriendly, formatIsoTime } from '@/shared/utils/formatIsoDate'
import { DateRangeCard } from './cards/DateRangeCard'
import { TimeRangeCard } from './cards/TimeRangeCard'
import { toDateOnly } from '@/shared/data-validation/timeValidation'

type OrderDetailSummaryProps = {
  order: Order | null
}



export const OrderDetailTimeWindows = ({ order }: OrderDetailSummaryProps) => {

  const timeWindows:Record<string, Record<'start_at' | 'end_at', string>[] > = {}

  order?.delivery_windows?.forEach( t =>{
    const serializeDate = formatIsoDateFriendly(t.start_at)
    if ( !serializeDate ) return

    const start_at = formatIsoTime(t.start_at)! 

    const end_at = formatIsoTime(t.end_at)!

    if( serializeDate in timeWindows ){
      timeWindows[serializeDate].push({start_at,end_at})
    }
    timeWindows[serializeDate] = [{start_at,end_at}]
  })

  return (
      <div className="border-1 rounded-lg border-[var(--color-muted)]/40  px-4 py-4 h-[300px]  gap-3 flex flex-col overflow-y-auto scroll-thin">
        { order && order.delivery_windows?.length ?
          order?.delivery_windows?.map( (t,i) =>{
            const serializeDate = formatIsoDateFriendly(t.start_at)
            if ( !serializeDate ) return
            const timeWindow = timeWindows[serializeDate]

            return(
             <div className={`flex flex-col  gap-2 `} key={`order_time_window_group_${order.id}_${i}`}>
                <span className="font-bold text-xs">
                    {serializeDate}
                </span>
                { 
                  timeWindow.map((w,e) =>{
                    return(
                      <TimeRangeCard from={w.start_at} to={w.end_at} key={`order_time_window_${order.id}_${i}_${e}`} />
                    )
                  })
                }
            </div>
            )
          })
          :
          <div className="flex items-center justify-center h-full">
            <span className="text-sm text-[var(--color-muted)]">
              No time windows set.
            </span>
          </div>
          
        }
         
      </div>
  )
}



