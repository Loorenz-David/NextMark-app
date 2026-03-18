import { formatIsoDateRelative } from '@/shared/utils/formatIsoDate'
import type { CaseChat } from '../types'

type OrderCaseChatListProps = {
  chats: CaseChat[]
  currentUserId?: number | null
}

const resolveDisplayName = (chat: CaseChat, isMine: boolean) => {
  if (isMine) {
    return 'You'
  }

  if (typeof chat.user_name === 'string' && chat.user_name.trim()) {
    return chat.user_name.trim()
  }

  return 'Unknown user'
}

const resolveInitials = (name: string) => {
  const words = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)

  if (words.length === 0) {
    return '?'
  }

  if (words.length === 1) {
    return words[0].slice(0, 2).toUpperCase()
  }

  return `${words[0][0]}${words[1][0]}`.toUpperCase()
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
    <div className="flex flex-col gap-3 pt-2">
      {sortedChats.map((chat) => {
        const isMine = currentUserId != null && chat.user_id === currentUserId
        const creationDate = formatIsoDateRelative(chat.creation_date)
        const displayName = resolveDisplayName(chat, isMine)
        const initials = resolveInitials(displayName)

        return (
          <div
            key={chat.client_id}
            className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-[85%] ${isMine ? 'items-end' : 'items-start'} flex flex-col`}>
              <div className={`flex w-full items-end gap-2 ${isMine ? 'flex-row-reverse' : 'flex-row'}`}>
                <div
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-muted)]/20 text-[10px] font-semibold text-[var(--color-text)]"
                  title={displayName}
                >
                  {initials}
                </div>

                <div className={`max-w-[82%] rounded-lg border border-[var(--color-border)] px-3 py-2 ${isMine ? 'bg-[var(--color-muted)]/25' : 'bg-[var(--color-muted)]'}`}>
                  <p className={`text-sm break-words whitespace-pre-wrap ${isMine ? 'text-[var(--color-text)]' : 'text-white'}`}>
                    {chat.message}
                  </p>
                </div>
              </div>

              <div className={`mt-1 flex w-full gap-2 text-[10px] text-[var(--color-muted)] ${isMine ? 'justify-end pr-9' : 'justify-start pl-9'}`}>
                <span className="text-[8px]">{creationDate ?? chat.creation_date}</span>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
