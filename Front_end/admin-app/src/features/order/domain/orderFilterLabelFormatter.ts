import type { FilterConfig } from '@/shared/searchBars'

const WORD_OVERRIDES: Record<string, string> = {
  id: 'ID',
}

export const ORDER_FILTER_LABEL_OVERRIDES: Record<string, string> = {
  plan_id: 'Plan ID',
}

const toStartCase = (value: string): string =>
  value
    .split(/\s+/)
    .filter(Boolean)
    .map((word, index) => {
      const lowercaseWord = word.toLowerCase()
      const override = WORD_OVERRIDES[lowercaseWord]
      if (override) return override
      if (index === 0) return `${lowercaseWord.charAt(0).toUpperCase()}${lowercaseWord.slice(1)}`
      return lowercaseWord
    })
    .join(' ')

const humanizeFilterKey = (key: string): string => {
  const normalized = key
    .replace(/-in-/g, ' in ')
    .replace(/[_-]+/g, ' ')

  return toStartCase(normalized)
}

const buildConfigLabelMap = (config: FilterConfig[]): Record<string, string> => {
  return config.reduce<Record<string, string>>((acc, filter) => {
    if (filter.type === 'option' || filter.type === 'number-list') {
      acc[filter.key] = filter.label
    }
    return acc
  }, {})
}

export const createOrderFilterLabelFormatter = (
  config: FilterConfig[],
  overrides: Record<string, string> = ORDER_FILTER_LABEL_OVERRIDES,
) => {
  const configLabelMap = buildConfigLabelMap(config)

  return (key: string): string => {
    if (configLabelMap[key]) return configLabelMap[key]
    if (overrides[key]) return overrides[key]
    return humanizeFilterKey(key)
  }
}
