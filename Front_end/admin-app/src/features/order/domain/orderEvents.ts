export type OrderEventDefinition = {
  key: ORDER_EVENT_KEYS
  label: string
  description?: string
}

export const ORDER_EVENTS: OrderEventDefinition[] = [
  { key: 'order_created', label: 'Order created', description: 'Triggered when an order is created.' },
  { key: 'order_confirmed', label: 'Order confirmed', description: 'Triggered when an order is confirmed.' },
  { key: 'order_preparing', label: 'Order preparing', description: 'Triggered when an order is being prepared.' },
  { key: 'order_ready', label: 'Order ready', description: 'Triggered when an order is ready to be delivered or picked up.' },
  { key: 'order_processing', label: 'Out for delivery', description: 'Triggered when an order is out for delivery.' },
  { key: 'order_completed', label: 'Order completed', description: 'Triggered when an order is completed.' },
  { key: 'order_failed', label: 'Order failed', description: 'Triggered when an order fails.' },
  { key: 'order_cancelled', label: 'Order cancelled', description: 'Triggered when an order is cancelled.' },
  { key: 'order_delivery_plan_changed', label: 'Order changed delivery plan', description: 'Triggered when an order delivery plan changes.' },
]


export type ORDER_EVENT_KEYS = 
  |'order_created'
  |'order_confirmed'
  |'order_preparing'
  |'order_ready'
  |'order_processing'
  |'order_completed'
  |'order_failed'
  |'order_cancelled'
  |'order_delivery_plan_changed'