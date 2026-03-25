import type { Vehicle } from '../types/vehicle'

const matches = (value: string, query: string) =>
  value.toLowerCase().includes(query.toLowerCase())

export const filterVehicles = (items: Vehicle[], query: string) =>
  query
    ? items.filter((item) => matches(item.label ?? item.registration_number, query))
    : items
