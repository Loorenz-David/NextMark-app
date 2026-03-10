import { BasicButton } from '@/shared/buttons'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { ICONS } from '../constants/Icons'
import type { IntegrationKey } from '../types/integration'

type IntegrationStatus = 'connected' | 'failed' | 'pending'

export const IntegrationStatusPage = () => {
    const [params] = useSearchParams()
    const navigate = useNavigate()

    const integration = params.get('integration') as IntegrationKey
    const status = params.get('status') as IntegrationStatus | null
    const shop = params.get('shop')

    if (!integration || !status) {
        return (
        <div className="p-6">
            <h1 className="text-lg font-semibold">Integration</h1>
            <p className="text-red-500">Missing integration status.</p>
        </div>
        )
    }

    let Icon = null
    if(integration in ICONS){
        Icon = ICONS[integration]
    }
    

  const statusConfig = {
    connected: {
      title: 'Connected',
      color: 'text-green-600',
      description: 'The integration was successfully connected.',
    },
    failed: {
      title: 'Connection failed',
      color: 'text-red-600',
      description: 'Something went wrong during the connection.',
    },
    pending: {
      title: 'Pending',
      color: 'text-yellow-600',
      description: 'The integration is still being processed.',
    },
  }[status]

  return (
    <div className="flex h-full flex-col items-center justify-center  text-center">
      <div className="flex flex-col shadow-lg items-center justify-center p-6 rounded-lg border-1 border-[var(--color-border)]">
        {Icon ? (
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full  text-[var(--color-text)]">
            <Icon.icon className={Icon.size} />
          </div>
        ) : null}

        <h1 className="text-xl font-semibold capitalize">
          {integration} integration
        </h1>
        <p className={`mt-2 text-lg font-medium ${statusConfig.color}`}>
          {statusConfig.title}
        </p>

        <div className="flex flex-col gap-2 p-3 mt-5">
          <p className=" max-w-md text-sm text-muted-foreground">
            {statusConfig.description}
          </p>
          {shop && (
            <p className=" text-sm">
              <span className="font-medium">Shop:</span> {shop}
            </p>
          )}
        </div>


        <div className="mt-6">
          <BasicButton params={{
            onClick:() => navigate('/'),
            variant:"primary"
          }}
          >
            Back to Home
          </BasicButton>
        </div>
      </div>
    </div>
  )
}
