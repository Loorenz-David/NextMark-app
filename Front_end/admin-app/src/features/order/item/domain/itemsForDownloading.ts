import { selectPlanByServerId, usePlanStore } from "@/features/plan/store/plan.slice";
import type { Item } from "../types";
import { toDateOnly, validateDateComparison } from "@/shared/data-validation/timeValidation";


type ExtraProps = {
    delivery_date?: string | null
    order_reference_number?:string | null
}

type ItemForDownloading = {
    itemPayload:Item & ExtraProps
}

export const itemsForDownloading = (items:Item[], order_reference_number?:string | null, delivery_plan_id?:number | null  )=>{

    let planDeliveryDate:string | null = null
    if(delivery_plan_id){
        const plan = selectPlanByServerId(delivery_plan_id)(usePlanStore.getState())

        const startDate = plan?.start_date ?? ''
        const endDate = plan?.end_date ?? ''
        if ( validateDateComparison(startDate, endDate, 'are_equal_dates')){
            planDeliveryDate =  toDateOnly(startDate)
        }else{
            planDeliveryDate =  toDateOnly(startDate) + '  --  ' + toDateOnly(endDate)
        }
    }

    const expandedItems: ItemForDownloading[] = []
    for (const item of items){
        if(!item?.quantity) continue
        for (let i = 0; i < item.quantity; i++){
            expandedItems.push({
                itemPayload:{
                ...item,
                order_reference_number: order_reference_number ?? '',
                delivery_date: planDeliveryDate ?? ''

                }
            })
        }
    }

    return expandedItems
}