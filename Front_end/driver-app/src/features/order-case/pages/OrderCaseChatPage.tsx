import { OrderCaseChatComposer, OrderCaseChatHeader, OrderCaseChatThread } from '../components'
import { useOrderCaseChatPageController } from '../controllers'

export function OrderCaseChatPage() {
  const {
    orderCaseId,
    onBack,
    onClose,
    onSelectState,
    orderCase,
    chats,
    currentUserId,
    draft,
    isLoading,
    isSending,
    isUpdatingState,
    loadError,
    sendError,
    stateError,
    setDraft,
    sendMessage,
  } = useOrderCaseChatPageController()

  return (
    <section className="relative z-10 [grid-area:overlay] flex h-full min-h-0 w-full flex-col bg-[rgb(var(--bg-app-color))] text-white">
      <OrderCaseChatHeader
        onBack={onBack}
        onClose={onClose}
        onSelectState={onSelectState}
        state={orderCase?.state ?? 'Open'}
        title={orderCase?.label ?? `Case #${orderCase?.id ?? orderCaseId}`}
        isUpdatingState={isUpdatingState}
      />
      <div
        className="min-h-0 flex-1 overflow-y-auto px-5 py-5"
        data-bottom-sheet-scroll-root
      >
        {stateError ? (
          <p className="mb-4 text-sm text-red-200">{stateError}</p>
        ) : null}
        {isLoading ? (
          <div className="rounded-2xl border border-white/12 bg-white/6 px-4 py-5 text-sm text-white/60">
            Loading conversation...
          </div>
        ) : loadError ? (
          <div className="rounded-2xl border border-red-300/20 bg-red-400/10 px-4 py-5 text-sm text-red-100">
            {loadError}
          </div>
        ) : (
          <OrderCaseChatThread
            chats={chats}
            currentUserId={currentUserId}
          />
        )}

        {sendError ? (
          <p className="mt-4 text-sm text-red-200">{sendError}</p>
        ) : null}
      </div>

      <OrderCaseChatComposer
        isSending={isSending}
        onChange={setDraft}
        onSend={sendMessage}
        value={draft}
      />
    </section>
  )
}
