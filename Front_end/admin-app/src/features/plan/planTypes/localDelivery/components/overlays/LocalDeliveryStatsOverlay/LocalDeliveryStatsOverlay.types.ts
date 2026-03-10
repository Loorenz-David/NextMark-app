export type LocalDeliveryDriverOverlayStats = {
  initials: string
  name: string
  registration: string
}

export type LocalDeliverySummaryMetric = {
  id: string
  label: string
  value: string
  delta?: string | null
}

export type LocalDeliveryRouteSummaryStats = {
  rows: [
    [LocalDeliverySummaryMetric, LocalDeliverySummaryMetric, LocalDeliverySummaryMetric],
    [LocalDeliverySummaryMetric, LocalDeliverySummaryMetric, LocalDeliverySummaryMetric],
    [LocalDeliverySummaryMetric, LocalDeliverySummaryMetric, LocalDeliverySummaryMetric],
  ]
}

export type LocalDeliveryGaussianMetricFace = {
  id: string
  label: string
  displayValue: string
  progressValue: number
  accentClassName?: string
}

export type LocalDeliveryGaussianMetricCard = {
  id: string
  faces: LocalDeliveryGaussianMetricFace[]
}

export type LocalDeliveryConsumptionMetric = {
  id: string
  label: string
  displayValue: string
}

export type LocalDeliveryTimingAnalytics = {
  unclassifiedStopCount: number
  arrivalDelaySeconds: number
  arrivalEarlySeconds: number
}

export type LocalDeliveryStatsOverlayData = {
  routeSummary: LocalDeliveryRouteSummaryStats
  driver: LocalDeliveryDriverOverlayStats
  gaussianCards: LocalDeliveryGaussianMetricCard[]
  consumptionMetrics: LocalDeliveryConsumptionMetric[]
  timingAnalytics: LocalDeliveryTimingAnalytics
}

export type LocalDeliveryStatsLayoutMode = 'wide' | 'medium' | 'narrow'
