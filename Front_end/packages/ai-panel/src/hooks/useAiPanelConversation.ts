import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { clearPersistedThread, readPersistedThread, writePersistedThread } from '../layout'
import { createAiPanelMessage } from '../message'
import type {
  AiActionDescriptor,
  AiMessageContext,
  AiPanelController,
  AiPanelMessage,
  AiTransportAdapter,
} from '../types'

interface UseAiPanelConversationParams {
  transport: AiTransportAdapter
  storageKey: string
  resolveAction?: (action: AiActionDescriptor) => void | Promise<void>
  onOpen: () => void
  onToggle: () => void
  onClose: () => void
}

interface AiPanelConversationState {
  controller: AiPanelController
  composerValue: string
  setComposerValue: (value: string) => void
  activeActionId: string | null
  runAction: (action: AiActionDescriptor) => Promise<void>
}

export function useAiPanelConversation({
  transport,
  storageKey,
  resolveAction,
  onOpen,
  onToggle,
  onClose,
}: UseAiPanelConversationParams): AiPanelConversationState {
  const [threadId, setThreadId] = useState<string | null>(() => readPersistedThread(storageKey))
  const [messages, setMessages] = useState<AiPanelMessage[]>([])
  const [composerValue, setComposerValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [activeActionId, setActiveActionId] = useState<string | null>(null)
  const lastPromptRef = useRef<string | null>(null)

  // On mount: if we have a persisted threadId and transport supports loadThread,
  // restore the conversation history.
  useEffect(() => {
    const persistedThreadId = readPersistedThread(storageKey)
    if (!persistedThreadId || !transport.loadThread) return

    let cancelled = false
    transport.loadThread(persistedThreadId).then((state) => {
      if (cancelled) return
      setThreadId(state.threadId)
      setMessages(state.messages)
    }).catch(() => {
      // Thread expired or inaccessible — clear persisted id
      clearPersistedThread(storageKey)
      setThreadId(null)
    })

    return () => { cancelled = true }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // intentionally runs once on mount only

  const clearConversation = useCallback(() => {
    setMessages([])
    setThreadId(null)
    setComposerValue('')
    lastPromptRef.current = null
    clearPersistedThread(storageKey)
  }, [storageKey])

  const send = useCallback(
    async (message?: string, context?: AiMessageContext) => {
      const nextMessage = (message ?? composerValue).trim()
      if (!nextMessage || isLoading) {
        return
      }

      onOpen()
      setComposerValue('')
      setMessages((current) => [
        ...current,
        createAiPanelMessage({ role: 'user', content: nextMessage }),
      ])
      setIsLoading(true)
      lastPromptRef.current = nextMessage

      let activeThreadId = threadId
      if (!activeThreadId) {
        const createdThread = await transport.createThread()
        activeThreadId = createdThread.threadId
        setThreadId(createdThread.threadId)
        writePersistedThread(storageKey, createdThread.threadId)
      }

      try {

        const response = await transport.sendMessage({
          threadId: activeThreadId,
          message: nextMessage,
          context,
        })

        setThreadId(response.threadId)
        setMessages((current) => [
          ...current,
          createAiPanelMessage({
            role: response.message.role ?? 'assistant',
            content: response.message.content,
            statusLabel: response.message.statusLabel,
            intent: response.message.intent,
            narrativePolicy: response.message.narrativePolicy,
            renderingHints: response.message.renderingHints,
            typedWarnings: response.message.typedWarnings,
            blocks: response.message.blocks,
            actions: response.message.actions,
            toolTrace: response.message.toolTrace,
            data: response.message.data,
            interactions: response.message.interactions,
          }),
        ])
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'The AI request failed.'
        setMessages((current) => [
          ...current,
          createAiPanelMessage({ role: 'error', content: errorMessage }),
        ])
      } finally {
        setIsLoading(false)
      }
    },
    [composerValue, isLoading, onOpen, storageKey, threadId, transport],
  )

  const retryLast = useCallback(async () => {
    if (!lastPromptRef.current) {
      return
    }

    await send(lastPromptRef.current)
  }, [send])

  const runAction = useCallback(
    async (action: AiActionDescriptor) => {
      if (!resolveAction || action.disabled) {
        return
      }

      const actionId = action.id ?? `${action.type}-${action.label}`
      setActiveActionId(actionId)

      try {
        await resolveAction(action)
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'The AI action failed.'
        setMessages((current) => [
          ...current,
          createAiPanelMessage({ role: 'error', content: errorMessage }),
        ])
      } finally {
        setActiveActionId(null)
      }
    },
    [resolveAction],
  )

  const controller = useMemo<AiPanelController>(
    () => ({
      isOpen: false,
      isLoading,
      threadId,
      messages,
      open: onOpen,
      close: onClose,
      toggle: onToggle,
      clearConversation,
      retryLast,
      send,
    }),
    [clearConversation, isLoading, messages, onClose, onOpen, onToggle, retryLast, send, threadId],
  )

  return {
    controller,
    composerValue,
    setComposerValue,
    activeActionId,
    runAction,
  }
}
