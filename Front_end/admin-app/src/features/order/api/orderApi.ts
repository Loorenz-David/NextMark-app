import { createOrdersApi } from '@shared-api'
import { apiClient } from '@/lib/api/ApiClient'

export type {
  OrderDeletePayload,
  OrderDetailResponse,
  OrderListResponse,
  OrderMapMarkerResponse,
  OrderUpdatePayload,
} from '@shared-api'

const ordersApi = createOrdersApi(apiClient)

export const {
  listOrders,
  getOrder,
  createOrder,
  updateOrder,
  deleteOrder,
  archiveOrder,
  unarchiveOrder,
  updateOrderDeliveryPlan,
  resolveOrderBatchSelection,
  updateOrdersDeliveryPlanBatch,
  listOrderMapMarkers,
} = ordersApi

export const useGetOrders = () => listOrders
export const useGetOrder = () => getOrder
export const useCreateOrder = () => createOrder
export const useUpdateOrder = () => updateOrder
export const useDeleteOrder = () => deleteOrder
export const useUpdateOrderDeliveryPlan = () => updateOrderDeliveryPlan
export const useResolveOrderBatchSelection = () => resolveOrderBatchSelection
export const useUpdateOrdersDeliveryPlanBatch = () => updateOrdersDeliveryPlanBatch
export const useArchiveOrder = () => archiveOrder
export const useUnarchiveOrder = () => unarchiveOrder
export const useListOrderMapMarkers = () => listOrderMapMarkers
