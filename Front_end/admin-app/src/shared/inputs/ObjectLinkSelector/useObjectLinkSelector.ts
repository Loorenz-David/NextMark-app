import { useCallback, useMemo, useState } from 'react'

import type { ObjectLinkSelectorItem, ObjectLinkSelectorMode } from './ObjectLinkSelector.types'

type UseObjectLinkSelectorProps = {
  mode: ObjectLinkSelectorMode
  onSelectItem: (item: ObjectLinkSelectorItem) => void
  onQueryChange?: (value: string) => void
  queryValue?: string
  defaultQueryValue?: string
}

export const useObjectLinkSelector = ({
  mode,
  onSelectItem,
  onQueryChange,
  queryValue,
  defaultQueryValue = '',
}: UseObjectLinkSelectorProps) => {
  const [internalQuery, setInternalQuery] = useState(defaultQueryValue)
  const [isOptionsOpen, setIsOptionsOpen] = useState(false)
  const [isSelectedOverlayOpen, setIsSelectedOverlayOpen] = useState(false)

  const query = queryValue ?? internalQuery

  const setQuery = useCallback(
    (value: string) => {
      if (queryValue === undefined) {
        setInternalQuery(value)
      }
      onQueryChange?.(value)
    },
    [onQueryChange, queryValue],
  )

  const displayValue = useMemo(() => query, [query])

  const handleInputChange = useCallback(
    (value: string) => {
      setQuery(value)
      setIsOptionsOpen(true)
    },
    [setQuery],
  )

  const handleSelectItem = useCallback(
    (item: ObjectLinkSelectorItem) => {
      onSelectItem(item)
      setQuery('')

      if (mode === 'single') {
        setIsOptionsOpen(false)
        return
      }

      setIsOptionsOpen(true)
    },
    [mode, onSelectItem, setQuery],
  )

  const handleToggleOptions = useCallback(() => {
    setIsOptionsOpen((current) => !current)
  }, [])

  const handleInputFocus = useCallback(() => {
    setIsOptionsOpen(true)
  }, [])

  const handleOpenSelectedOverlay = useCallback(() => {
    setIsOptionsOpen(false)
    setIsSelectedOverlayOpen(true)
  }, [])

  const handleCloseSelectedOverlay = useCallback(() => {
    setIsSelectedOverlayOpen(false)
  }, [])

  return {
    query,
    displayValue,
    isOptionsOpen,
    isSelectedOverlayOpen,
    setIsOptionsOpen,
    handleInputChange,
    handleInputFocus,
    handleSelectItem,
    handleToggleOptions,
    handleOpenSelectedOverlay,
    handleCloseSelectedOverlay,
  }
}
