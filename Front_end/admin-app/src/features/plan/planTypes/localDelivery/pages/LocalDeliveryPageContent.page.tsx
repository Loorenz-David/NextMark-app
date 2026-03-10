
import { LocalDeliveryOrderList, MainHeaderLocalDeliveryPage } from '../components'
import { OptimizationLoading } from '../components/spinners/Optimization.spinner'
import { MIN_LOADER_VISIBLE_MS } from '../constants/optimization.constants'
import { useLocalDeliveryContext } from '../context/useLocalDeliveryContext'


export const LocalDeliveryPageContent = () => {
  const { orderCount, localDeliveryPlan } = useLocalDeliveryContext()

  const isLoading = localDeliveryPlan?.is_loading
  const optimizationStartedAt = localDeliveryPlan?.optimization_started_at ?? null

  return (
    <div className="w-full h-full flex flex-col bg-[var(--color-primary)]/5">
      <MainHeaderLocalDeliveryPage />
     
      {!isLoading 
        ? <LocalDeliveryOrderList/>
        : isLoading == 'isOptimizing' 
          ? <OptimizationLoading message={
            <>
              <p className="font-semibold text-[var(--color-muted)]">
                Optimization in progress
              </p>
              <p className="text-sm opacity-70">
                You can come back when it is ready.
              </p>
            </>
          } startedAt={optimizationStartedAt} orderCount={orderCount} minDurationMs={MIN_LOADER_VISIBLE_MS} />
          : null
      }

    </div>
  )
}
