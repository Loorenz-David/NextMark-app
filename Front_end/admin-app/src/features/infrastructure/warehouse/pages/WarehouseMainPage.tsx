import type { StackComponentProps } from '@/shared/stack-manager/types'

import { WarehouseProvider } from '../context/WarehouseProvider'
import { WarehouseSectionLayout } from '../components/WarehouseSectionLayout'
import { WarehouseCard } from '../components/WarehouseCard'
import { useWarehouseController } from '../hooks/useWarehouseController'

const WarehouseMainContent = () => {
  const { items, query, setQuery, openCreate, openEdit } = useWarehouseController()

  return (
    <WarehouseSectionLayout
      title="Warehouses"
      description="Manage warehouse locations."
      onCreate={openCreate}
      query={query}
      onSearch={setQuery}
    >
      {items.map((warehouse) => (
        <WarehouseCard key={warehouse.client_id} warehouse={warehouse} onEdit={openEdit} />
      ))}
      {!items.length ? (
        <p className="text-sm text-[var(--color-muted)]">No warehouses found.</p>
      ) : null}
    </WarehouseSectionLayout>
  )
}

export const WarehouseMainPage = (_: StackComponentProps<undefined>) => (
  <WarehouseProvider>
    <WarehouseMainContent />
  </WarehouseProvider>
)
