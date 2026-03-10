import { SearchBar } from '@/shared/buttons/SearchBar'

import { TemplateTriggerCard } from '../../components/TemplateEventCard'
import { useEmailMessageContext } from '../context/useEmailMessageContext'

export const EmailTemplateList = () => {
  const { filteredTriggers, setSearchQuery, setActiveTrigger } = useEmailMessageContext()

  return (
    <div className="flex h-full min-h-0 w-full flex-col">
      <div className="flex shrink-0 w-full flex-col gap-4 bg-[var(--color-page)] px-6 py-4 pb-8 shadow-md border-b-1 border-b-[var(--color-border)]">
        <div className="flex flex-col gap-2">
          <h2 className="text-base font-semibold text-[var(--color-text)]">Email Template Triggers</h2>
          <p className="text-sm text-[var(--color-muted)]">Compose email templates with dynamic labels.</p>
        </div>
        <SearchBar
          onChange={(value) => setSearchQuery(value.input ?? '')}
          placeholder="Search template triggers..."
          className="w-full  rounded-full border border-[var(--color-muted)]/40 bg-white px-3 py-2"
        />
      </div>
      <div className="flex min-h-0 flex-1 bg-[var(--color-muted)]/15 ">
        <div className="grid h-full w-full auto-rows-max gap-x-3 gap-y-6 overflow-y-auto scroll-thin xl:grid-cols-2 py-10 px-6">
          {filteredTriggers.map(({ trigger, status }) => (
            <TemplateTriggerCard
              key={trigger.key}
              title={trigger.label}
              description={trigger.description}
              status={status}
              onSelect={() => setActiveTrigger(trigger)}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
