import type { Warehouse } from '../types/warehouse'

const matches = (value: string, query: string) =>
  value.toLowerCase().includes(query.toLowerCase())

export const filterWarehouses = (items: Warehouse[], query: string) =>
  query ? items.filter((item) => matches(item.name, query)) : items
