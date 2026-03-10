import { useContext } from 'react'

import { WarehouseContext } from './WarehouseContext'

export const useWarehouseContext = () => {
  const context = useContext(WarehouseContext)
  if (!context) {
    throw new Error('useWarehouseContext must be used within WarehouseProvider.')
  }
  return context
}
