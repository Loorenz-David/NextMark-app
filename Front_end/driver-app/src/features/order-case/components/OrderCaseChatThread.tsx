import type { CaseChat } from '../domain'

type OrderCaseChatThreadProps = {
  chats: CaseChat[]
  currentUserId?: number | null
}

export function OrderCaseChatThread({ chats, currentUserId }: OrderCaseChatThreadProps) {
  if (chats.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-white/15 bg-white/5 px-4 py-5 text-sm text-white/55">
        No messages yet.
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {chats.map((chat) => {
        const isMine = currentUserId != null && chat.user_id === currentUserId
        return (
          <div
            key={chat.client_id}
            className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-[82%] rounded-2xl px-4 py-3 ${isMine ? 'bg-cyan-400/15 text-white' : 'bg-white/8 text-white/90'}`}>
              <p className="whitespace-pre-wrap break-words text-sm">{chat.message}</p>
              <p className="mt-2 text-[11px] text-white/45">
                {new Intl.DateTimeFormat('sv-SE', {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                }).format(new Date(chat.creation_date))}
              </p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
