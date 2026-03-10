import { useMemo } from 'react'

import { createRouteSolutionWarningRegistry } from '@/features/plan/planTypes/localDelivery/domain/routeSolutionWarningRegistry'

export const useRouteSolutionWarningRegistry = () =>
  useMemo(() => createRouteSolutionWarningRegistry(), [])

