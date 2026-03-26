import { LocalDeliveryProvider } from '../context/LocalDelivery.provider'
import { LocalDeliveryPageContent } from './LocalDeliveryPageContent.page'

type PlanOrdersPagePayload = {
  planId?: number 
  freshAfter?: string | null
}

type LocalDeliveryPageProps = {
  payload: PlanOrdersPagePayload
}




export const LocalDeliveryPage = ({ payload }: LocalDeliveryPageProps) => {

  const planId = payload?.planId
  if (planId == null) return null

  return (
    <LocalDeliveryProvider planId={planId}>
      <LocalDeliveryPageContent />
    </LocalDeliveryProvider>
  )
}
