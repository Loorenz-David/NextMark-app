import { useMemo, useState } from 'react'

import { filterVehicles } from '../domain/useVehicleRules'
import { useVehicleFlow } from './useVehicleFlow'
import { useVehicles } from './useVehicleSelectors'
import { useVehicleActions } from './useVehicleActions'

export const useVehicleController = () => {
  useVehicleFlow()
  const items = useVehicles()
  const actions = useVehicleActions()
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => filterVehicles(items, query), [items, query])

  return {
    items: filtered,
    query,
    setQuery,
    openCreate: () => actions.openVehicleForm({ mode: 'create' }),
    openEdit: (clientId: string) => actions.openVehicleForm({ mode: 'edit', clientId }),
  }
}
