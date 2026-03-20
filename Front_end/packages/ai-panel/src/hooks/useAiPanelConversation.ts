import { useCallback, useMemo, useRef, useState } from 'react'

import { createAiPanelMessage } from '../message'
import type {
  AiActionDescriptor,
  AiPanelController,
  AiPanelMessage,
  AiTransportAdapter,
} from '../types'

interface UseAiPanelConversationParams {
  transport: AiTransportAdapter
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
  resolveAction,
  onOpen,
  onToggle,
  onClose,
}: UseAiPanelConversationParams): AiPanelConversationState {
  const [threadId, setThreadId] = useState<string | null>(null)
  const [messages, setMessages] = useState<AiPanelMessage[]>([])
  const [composerValue, setComposerValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [activeActionId, setActiveActionId] = useState<string | null>(null)
  const lastPromptRef = useRef<string | null>(null)

  const clearConversation = useCallback(() => {
    setMessages([])
    setThreadId(null)
    setComposerValue('')
    lastPromptRef.current = null
  }, [])

  const send = useCallback(
    async (message?: string, context?: unknown) => {
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
            actions: response.message.actions,
            toolTrace: response.message.toolTrace,
            data: response.message.data,
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
    [composerValue, isLoading, onOpen, threadId, transport],
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
