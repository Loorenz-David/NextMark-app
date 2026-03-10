import { Outlet, useNavigate, useParams } from 'react-router-dom'

import { templateChannels } from '../domain/templateChannel.map'
import type { availableChannels } from '../types'
import { ChannelTabs } from '../components/ChannelTabs'

export const PrintTemplateMainPage = () => {

  const navigate = useNavigate()
  const params = useParams()
  const activeChannel = params.channel as availableChannels | undefined

  return (
    <div className="flex h-full w-full flex-col ">
      <div className="flex flex-col gap-6 bg-[var(--color-page)] p-4 shadow-md pb-8">
        <div className="flex flex-col gap-2">
          <h2 className="text-lg font-semibold text-[var(--color-text)]">Print Templates</h2>
          <p className="text-sm text-[var(--color-muted)]">
            Configure automatic PDF downloads by channel and event.
          </p>
        </div>

        <ChannelTabs
          channels={templateChannels}
          activeChannel={activeChannel}
          onSelectChannel={(channel) => navigate(`/settings/print-templates/${channel}`)}
        />
      </div>

      <div className="min-h-0 flex-1 overflow-auto scroll-thin gap-4 bg-[var(--color-muted)]/15 p-4">
        <Outlet />
      </div>
    </div>
  )
}
