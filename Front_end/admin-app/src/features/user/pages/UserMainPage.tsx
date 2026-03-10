import { useEffect } from 'react'

import type { StackComponentProps } from '@/shared/stack-manager/types'

import { UserProvider } from '../context/UserProvider'
import { useUserContext } from '../context/UserContext'
import { useUserActions } from '../hooks/useUserActions'
import { useUserFlow } from '../hooks/useUserFlow'
import { UserProfileCard, UserSubscriptionCard } from '../components/UserProfileCard'


const UserMainContent = () => {
  const { user } = useUserContext()
  const { openEditProfile } = useUserActions()
  const { loadProfile } = useUserFlow()
  

  useEffect(() => {
    void loadProfile()
  }, [])

  return (
    <div className="flex h-full w-full flex-col gap-6 p-6">
      <UserProfileCard user={user} onEdit={openEditProfile} />
      <UserSubscriptionCard />
    </div>
  )
}

export const UserMainPage = (_: StackComponentProps<undefined>) => (
  <UserProvider>
    <UserMainContent />
  </UserProvider>
)
