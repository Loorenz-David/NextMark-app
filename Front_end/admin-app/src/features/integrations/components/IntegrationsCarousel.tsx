import type { IntegrationView } from '../context/IntegrationsContext'
import type { IntegrationKey } from '../types/integration'

import { IntegrationCard } from './IntegrationCard'

type IntegrationsCarouselProps = {
  integrations: IntegrationView[]
  onAdd: (key: IntegrationKey) => void
  onEdit: (key: IntegrationKey, integrationId: number | null) => void
  onRemove: (key: IntegrationKey, integrationId: number | null) => void
}

export const IntegrationsCarousel = ({
  integrations,
  onAdd,
  onEdit,
  onRemove,
}: IntegrationsCarouselProps) => (
  <div className="flex h-full w-full overflow-hidden justify-center   bg-[var(--color-muted)]/10 ">

    <div className='flex gap-8 overflow-x-auto px-6 py-10'>
      {integrations.map(({ definition }) => (
        <IntegrationCard
          key={definition.key}
          definition={definition}
          isActive={definition.isActive}
          onAdd={() => onAdd(definition.key)}
          onEdit={() => onEdit(definition.key, definition.id)}
          onRemove={() => onRemove(definition.key, definition.id)}
        />
      ))}
    </div>
  </div>
)
