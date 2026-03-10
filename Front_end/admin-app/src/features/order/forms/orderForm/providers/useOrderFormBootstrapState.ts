import { useEffect, useMemo, useRef, useState } from 'react'

import { makeInitialFormCopy } from '@shared-domain'

import type { Order } from '../../../types/order'
import {
  buildOrderFormInitialState,
  buildOrderFormReinitKey,
  shouldReinitializeForm,
} from '../flows/orderFormBootstrap.flow'
import type { OrderFormMode, OrderFormState } from '../state/OrderForm.types'

export const useOrderFormBootstrapState = ({
  mode,
  order,
  payloadClientId,
  payloadDeliveryPlanId,
  payloadRestoreFormState,
}: {
  mode: OrderFormMode
  order: Order | null
  payloadClientId?: string | null
  payloadDeliveryPlanId?: number | null
  payloadRestoreFormState?: OrderFormState | null
}) => {
  const initialFormRef = useRef<OrderFormState | null>(null)
  const previousReinitKeyRef = useRef<string | null>(null)

  const [formState, setFormState] = useState<OrderFormState>(() =>
    buildOrderFormInitialState({
      mode,
      order,
      payloadDeliveryPlanId: payloadDeliveryPlanId ?? null,
      payloadRestoreFormState: payloadRestoreFormState ?? null,
    }),
  )

  const reinitKey = useMemo(
    () =>
      buildOrderFormReinitKey({
        mode,
        payloadClientId: payloadClientId ?? null,
        payloadDeliveryPlanId: payloadDeliveryPlanId ?? null,
        orderServerId: order?.id ?? null,
      }),
    [mode, order?.id, payloadClientId, payloadDeliveryPlanId],
  )

  useEffect(() => {
    if (!shouldReinitializeForm(previousReinitKeyRef.current, reinitKey)) {
      return
    }

    const nextState = buildOrderFormInitialState({
      mode,
      order,
      payloadDeliveryPlanId: payloadDeliveryPlanId ?? null,
      payloadRestoreFormState: payloadRestoreFormState ?? null,
    })

    setFormState(nextState)
    makeInitialFormCopy(initialFormRef, nextState)
    previousReinitKeyRef.current = reinitKey
  }, [mode, order, payloadDeliveryPlanId, payloadRestoreFormState, reinitKey])

  return {
    formState,
    setFormState,
    initialFormRef,
  }
}
