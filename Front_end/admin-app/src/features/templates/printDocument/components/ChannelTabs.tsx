import type { availableChannels } from '../types'

type ChannelTabsProps = {
  channels: availableChannels[]
  activeChannel?: availableChannels
  onSelectChannel: (channel: availableChannels) => void
}

export const ChannelTabs = ({
  channels,
  activeChannel,
  onSelectChannel,
}: ChannelTabsProps) => {
  return (
    <div className="flex flex-wrap gap-3">
      {channels.map((channel) => {
        const isActive = channel === activeChannel
        return (
          <button
            key={channel}
            type="button"
            onClick={() => onSelectChannel(channel)}
            className={`rounded-lg px-4 py-2 text-xs font-semibold ${
              isActive 
                ? 'bg-[var(--color-blue-500)] text-white'
                : 'bg-[var(--color-muted)]/10 text-[var(--color-text)]'
            }`}
          >
            {channel}
          </button>
        )
      })}
    </div>
  )
}
