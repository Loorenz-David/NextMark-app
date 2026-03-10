import { create } from 'zustand'

/**
 * Generic pagination shape
 * Matches cursor-based OR offset-based APIs
 */
export type Pagination = {
  has_more: boolean
  next_cursor?: string | number | null
  prev_cursor?: string | number | null
  limit?: number
}

/**
 * Generic list state
 * S = stats shape (domain-specific)
 * Q = query params shape (filters, sorting, etc.)
 * P = pagination shape (domain-specific)
 */
export type ListState<S = unknown, Q = unknown, P = Pagination> = {
  // identity
  queryKey?: string
  query?: Q

  // meta
  stats?: S
  pagination?: P

  // status
  isLoading: boolean
  error?: string

  // actions
  setLoading: (loading: boolean) => void
  setResult: (payload: {
    queryKey: string
    query?: Q
    stats?: S
    pagination?: P
  }) => void
  setError: (error?: string) => void
  clear: () => void
}

/**
 * Generic list store factory
 */
export const createListStore = <S = unknown, Q = unknown, P = Pagination> () =>
  create<ListState<S, Q, P>>((set) => ({
    queryKey: undefined,
    query: undefined,

    stats: undefined,
    pagination: undefined,

    isLoading: false,
    error: undefined,

    setLoading: (loading) =>
      set(() => ({ isLoading: loading })),

    setResult: ({ queryKey, query, stats, pagination }) =>
      set(() => ({
        queryKey,
        query,
        stats,
        pagination,
        isLoading: false,
        error: undefined,
      })),

    setError: (error) =>
      set(() => ({
        error,
        isLoading: false,
      })),

    clear: () =>
      set(() => ({
        queryKey: undefined,
        query: undefined,
        stats: undefined,
        pagination: undefined,
        isLoading: false,
        error: undefined,
      })),
  }))
