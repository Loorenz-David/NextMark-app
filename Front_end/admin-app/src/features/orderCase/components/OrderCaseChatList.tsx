import { formatIsoDateRelative } from '@/shared/utils/formatIsoDate'
import type { CaseChat } from '../types'

type OrderCaseChatListProps = {
  chats: CaseChat[]
  currentUserId?: number | null
}

export const OrderCaseChatList = ({ chats, currentUserId }: OrderCaseChatListProps) => {
  if (!chats.length) {
    return (
      <div className="rounded-lg border border-dashed border-[var(--color-border)] bg-[var(--color-page)] p-4 text-sm text-[var(--color-muted)]">
        No messages yet.
      </div>
    )
  }

  const sortedChats = [...chats].sort((a, b) =>
    new Date(a.creation_date).getTime() - new Date(b.creation_date).getTime(),
  )

  return (
    <div className="flex flex-col gap-3 pt-2 ">
      {sortedChats.map((chat) => {
        const isMine = currentUserId != null && chat.user_id === currentUserId
        const creationDate = formatIsoDateRelative(chat.creation_date)
        return (
          <div
            key={chat.client_id}
            className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
          >
            <div className="max-w-[80%] min-w-[30%] ">
              <div className={`rounded-lg border border-[var(--color-border)] px-3 py-2 ${isMine ? 'bg-[var(--color-muted)]/25': 'bg-[var(--color-muted)]' }`}>
                <p className={`text-sm break-words whitespace-pre-wrap ${isMine ? 'text-[var(--color-text)] ' : 'text-white '}`}>
                  {chat.message}
                </p>
              </div>
              <div className={`mt-1 flex gap-2 text-[10px] text-[var(--color-muted)] ${isMine ? 'justify-end' : 'jsutify-start'}`}>
                <span className="text-[8px]">{creationDate}</span>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
