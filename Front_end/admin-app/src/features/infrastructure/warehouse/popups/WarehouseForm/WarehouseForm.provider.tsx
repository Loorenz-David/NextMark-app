import type { ReactNode } from 'react'
import { useEffect, useMemo, useRef, useState } from 'react'

import { makeInitialFormCopy } from '@shared-domain'

import { useWarehouseByClientId } from '../../hooks/useWarehouseSelectors'

import { WarehouseFormContextProvider } from './WarehouseForm.context'
import type { WarehouseFormPayload, WarehouseFormState } from './WarehouseForm.types'
import { useWarehouseFormWarnings } from './WarehouseForm.warnings'
import { useWarehouseFormValidation } from './WarehouseForm.validation'
import { useWarehouseFormSubmit } from './useWarehouseFormSubmit'

const buildInitialForm = (
  payload: WarehouseFormPayload,
  name?: string,
  location?: WarehouseFormState['property_location'],
) => ({
  name: name ?? '',
  property_location: location ?? null,
})

export const WarehouseFormProvider = ({
  children,
  payload,
}: {
  children: ReactNode
  payload: WarehouseFormPayload
}) => {
  const existing = useWarehouseByClientId(payload.clientId ?? null)
  const [formState, setFormState] = useState<WarehouseFormState>(() =>
    buildInitialForm(payload, existing?.name, existing?.property_location as WarehouseFormState['property_location']),
  )
  const initialFormRef = useRef<WarehouseFormState | null>(null)
  const warnings = useWarehouseFormWarnings()

  useEffect(() => {
    const initial = buildInitialForm(
      payload,
      existing?.name,
      existing?.property_location as WarehouseFormState['property_location'],
    )
    setFormState(initial)
    makeInitialFormCopy(initialFormRef, initial)
  }, [existing?.name, existing?.property_location, payload])

  const { validateForm } = useWarehouseFormValidation({ formState, warnings })
  const submitters = useWarehouseFormSubmit({
    payload,
    formState,
    validateForm,
    initialFormRef,
  })

  const value = useMemo(
    () => ({
      payload,
      formState,
      setFormState,
      initialFormRef,
      warnings,
      ...submitters,
    }),
    [formState, payload, submitters, warnings],
  )

  return <WarehouseFormContextProvider value={value}>{children}</WarehouseFormContextProvider>
}
