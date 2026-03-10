import type { StackComponentProps } from '@/shared/stack-manager/types'

import { IntegrationsProvider } from '../context/IntegrationsProvider'
import { useIntegrationsContext } from '../context/useIntegrationsContext'
import { IntegrationsCarousel } from '../components/IntegrationsCarousel'

const IntegrationsPageContent = () => {
  const { integrations, openIntegrationConfig, removeIntegration } = useIntegrationsContext()

  return (
    <div className="flex h-full w-full flex-col overflow-hidden">
      <div className='p-6 pb-8 shadow-md'>
        <h2 className="text-base font-semibold text-[var(--color-text)]">Integrations</h2>
        <p className="text-xs text-[var(--color-muted)]">
          Configure integrations to connect external services.
        </p>
      </div>

      <IntegrationsCarousel
        integrations={integrations}
        onAdd={(key) => openIntegrationConfig(key, 'create', null)}
        onEdit={(key, integrationId) => openIntegrationConfig(key, 'edit', integrationId)}
        onRemove={removeIntegration}
      />
    </div>
  )
}

export const IntegrationsMainPage = (_: StackComponentProps<undefined>) => (
  <IntegrationsProvider>
    <IntegrationsPageContent />
  </IntegrationsProvider>
)
