export type FilterConfig =
  | {
      type: 'option'
      key: string
      label: string
      value: string | number | boolean
    }
  | {
      type: 'date-range'
      keyStart: string
      keyEnd: string
      label: string
    }

export type SearchFilterBarProps = {
  applySearch: (input: string) => void
  updateFilter?: (key: string, value: unknown) => void
  filters?: Record<string, unknown>
  config?: FilterConfig[]
  hideFilterIcon?: boolean
  placeholder?: string
}
