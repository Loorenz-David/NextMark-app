import { useNavigate } from 'react-router-dom'

import type { TemplateEventDefinition } from '../domain/templateEvent.map'
import { selectTemplateByEventAndChannel } from '../store'
import type { availableChannels, PrintTemplate } from '../types'

type EventCardProps = {
  channel: availableChannels
  templates: PrintTemplate[]
  eventDefinition: TemplateEventDefinition
}

export const EventCard = ({ channel, templates, eventDefinition }: EventCardProps) => {
  const navigate = useNavigate()

  const template = selectTemplateByEventAndChannel(eventDefinition.eventName, channel, templates)
  const status = !template ? 'Not configured' : template.enable ? 'Enabled' : 'Disabled'

  return (
    <button
      type="button"
      onClick={() => navigate(`/settings/print-templates/${channel}/${eventDefinition.eventName}`)}
      className="w-full rounded-xl border border-[var(--color-muted)]/40 bg-[var(--color-page)] p-4 text-left transition-colors hover:bg-[var(--color-light-blue)]/5 cursor-pointer"
    >
      <div className="flex items-center justify-between gap-3">
        <h4 className="text-sm font-semibold text-[var(--color-text)]">{eventDefinition.title}</h4>
        <span className="rounded-full bg-[var(--color-muted)]/15 px-2 py-0.5 text-xs text-[var(--color-muted)]">
          {status}
        </span>
      </div>
      <p className="mt-2 text-xs text-[var(--color-muted)]">{eventDefinition.description}</p>
    </button>
  )
}
