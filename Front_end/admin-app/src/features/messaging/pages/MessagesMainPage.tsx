import { useMemo, useState } from 'react'

import type { StackComponentProps } from '@/shared/stack-manager/types'

import { EmailMessageMainPage } from '../emailMessage/pages/EmailMessageMainPage'
import { SmsMessageMainPage } from '../smsMessage/pages/SmsMessageMainPage'
import { MessagesLayout } from '../layout/MessagesLayout'

type MessageTabKey = 'sms' | 'email'

const TABS: { key: MessageTabKey; label: string }[] = [
  { key: 'sms', label: 'SMS' },
  { key: 'email', label: 'Email' },
]

const MessagesMainContent = () => {
  const [activeTab, setActiveTab] = useState<MessageTabKey>('sms')

  const content = useMemo(() => {
    switch (activeTab) {
      case 'email':
        return <EmailMessageMainPage />
      case 'sms':
      default:
        return <SmsMessageMainPage />
    }
  }, [activeTab])

  return (
    <div className="h-full min-h-0">
      <MessagesLayout tabs={TABS} activeTab={activeTab} onTabChange={setActiveTab}>
        {content}
      </MessagesLayout>
    </div>
  )
}

export const MessagesMainPage = (_: StackComponentProps<undefined>) => <MessagesMainContent />
