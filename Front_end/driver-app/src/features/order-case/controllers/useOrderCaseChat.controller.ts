import { useEffect, useMemo, useState, useSyncExternalStore } from 'react'
import { useMessageHandler } from '@shared-message-handler'
import { useSession } from '@/app/providers/session.context'
import {
  selectCaseChatsByOrderCaseId,
  selectOrderCaseByClientId,
  useCaseChatsStore,
  useOrderCasesStore,
} from '../stores'
import {
  isOrderCaseStateTransitionAllowed,
  type OrderCaseState,
} from '../domain'
import { initializeOrderCaseChatFlow, sendOrderCaseChatFlow, updateOrderCaseStateFlow } from '../flows'

type UseOrderCaseChatControllerOptions = {
  orderCaseId: number
  orderCaseClientId: string
}

const MIN_CHAT_LOADING_MS = 1000

export function useOrderCaseChatController({
  orderCaseId,
  orderCaseClientId,
}: UseOrderCaseChatControllerOptions) {
  const { showMessage } = useMessageHandler()
  const { session } = useSession()
  const [draft, setDraft] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [sendError, setSendError] = useState<string | null>(null)
  const [isUpdatingState, setIsUpdatingState] = useState(false)
  const [stateError, setStateError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const currentUserId = useMemo(() => {
    const rawId = session?.user?.id
    if (typeof rawId === 'number') {
      return rawId
    }

    if (typeof rawId === 'string') {
      const parsed = Number(rawId)
      return Number.isFinite(parsed) ? parsed : null
    }

    return null
  }, [session?.user?.id])

  const orderCasesState = useSyncExternalStore(
    useOrderCasesStore.subscribe,
    useOrderCasesStore.getState,
    useOrderCasesStore.getState,
  )
  const caseChatsState = useSyncExternalStore(
    useCaseChatsStore.subscribe,
    useCaseChatsStore.getState,
    useCaseChatsStore.getState,
  )

  useEffect(() => {
    let cancelled = false

    async function initialize() {
      setIsLoading(true)
      setLoadError(null)
      const startedAt = Date.now()

      const didSucceed = await initializeOrderCaseChatFlow(orderCaseId)
      if (cancelled) {
        return
      }

      const elapsed = Date.now() - startedAt
      const remainingDelay = Math.max(0, MIN_CHAT_LOADING_MS - elapsed)

      if (remainingDelay > 0) {
        await new Promise((resolve) => {
          setTimeout(resolve, remainingDelay)
        })
      }

      if (cancelled) {
        return
      }

      if (!didSucceed) {
        setLoadError('Unable to load case chat.')
      }

      setIsLoading(false)
    }

    void initialize()

    return () => {
      cancelled = true
    }
  }, [orderCaseId])

  const orderCase = useMemo(
    () => selectOrderCaseByClientId(orderCaseClientId)(orderCasesState),
    [orderCaseClientId, orderCasesState],
  )
  const chats = useMemo(
    () => selectCaseChatsByOrderCaseId(caseChatsState, orderCaseId).sort(
      (left, right) => new Date(left.creation_date).getTime() - new Date(right.creation_date).getTime(),
    ),
    [caseChatsState, orderCaseId],
  )

  async function sendMessage() {
    setSendError(null)
    setIsSending(true)

    const didSucceed = await sendOrderCaseChatFlow({
      orderCaseId,
      message: draft,
      currentUserId,
    })

    setIsSending(false)

    if (!didSucceed) {
      showMessage({ status: 500, message: 'Unable to send message.' })
      setSendError('Unable to send message.')
      return
    }

    showMessage({ status: 200, message: 'Message sent.' })
    setDraft('')
  }

  async function selectState(nextState: OrderCaseState) {
    if (!orderCase?.id) {
      return false
    }

    if (!isOrderCaseStateTransitionAllowed(orderCase.state, nextState)) {
      return false
    }

    setStateError(null)
    setIsUpdatingState(true)
    showMessage({ status: 200, message: `Case moved to ${nextState.toLowerCase()}.` })

    const didSucceed = await updateOrderCaseStateFlow({
      orderCaseClientId,
      orderCaseId: orderCase.id,
      nextState,
    })

    setIsUpdatingState(false)

    if (!didSucceed) {
      showMessage({ status: 500, message: 'Unable to update case state.' })
      setStateError('Unable to update case state.')
      return false
    }

    return true
  }

  return {
    orderCase,
    chats,
    draft,
    setDraft,
    sendMessage,
    isSending,
    isLoading,
    loadError,
    sendError,
    stateError,
    isUpdatingState,
    selectState,
    currentUserId,
  }
}
