import { useMemo, useState } from 'react'

import { filterWarehouses } from '../domain/useWarehouseRules'
import { useWarehouseFlow } from './useWarehouseFlow'
import { useWarehouses } from './useWarehouseSelectors'
import { useWarehouseActions } from './useWarehouseActions'

export const useWarehouseController = () => {
  useWarehouseFlow()
  const items = useWarehouses()
  const actions = useWarehouseActions()
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => filterWarehouses(items, query), [items, query])

  return {
    items: filtered,
    query,
    setQuery,
    openCreate: () => actions.openWarehouseForm({ mode: 'create' }),
    openEdit: (clientId: string) => actions.openWarehouseForm({ mode: 'edit', clientId }),
  }
}
