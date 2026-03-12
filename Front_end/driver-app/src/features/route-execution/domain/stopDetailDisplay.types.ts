export type StopDetailHeaderDisplay = {
  streetAddress: string
  stopMeta: string
}

export type StopDetailPrimaryActionDisplay = {
  id: 'navigate' | 'failed' | 'completed'
  label: string
  tone: 'navigate' | 'failed' | 'completed'
}

export type StopDetailInfoRowDisplay = {
  id: 'service-time' | 'order-phone' | 'items'
  label: string
  value: string
  onPress?: () => void
}

export type StopDetailPageDisplay = {
  header: StopDetailHeaderDisplay
  primaryActions: StopDetailPrimaryActionDisplay[]
  infoRows: StopDetailInfoRowDisplay[]
}
