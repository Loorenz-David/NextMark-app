import type { StackComponentProps } from '@/shared/stack-manager/types'

import { VehicleProvider } from '../context/VehicleProvider'
import { VehicleSectionLayout } from '../components/VehicleSectionLayout'
import { VehicleCard } from '../components/VehicleCard'
import { useVehicleController } from '../hooks/useVehicleController'

const VehicleMainContent = () => {
  const { items, query, setQuery, openCreate, openEdit } = useVehicleController()

  return (
    <VehicleSectionLayout
      title="Vehicles"
      description="Manage fleet vehicles."
      onCreate={openCreate}
      query={query}
      onSearch={setQuery}
    >
      {items.map((vehicle) => (
        <VehicleCard key={vehicle.client_id} vehicle={vehicle} onEdit={openEdit} />
      ))}
      {!items.length ? (
        <p className="text-sm text-[var(--color-muted)]">No vehicles found.</p>
      ) : null}
    </VehicleSectionLayout>
  )
}

export const VehicleMainPage = (_: StackComponentProps<undefined>) => (
  <VehicleProvider>
    <VehicleMainContent />
  </VehicleProvider>
)
