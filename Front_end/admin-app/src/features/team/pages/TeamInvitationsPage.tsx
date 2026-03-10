import type { StackComponentProps } from '@/shared/stack-manager/types'

import { TeamProvider } from '../context/TeamProvider'
import { useTeamInvitationsFlow } from '../hooks/useTeamInvitationsFlow'
import { useTeamInvitationActions } from '../hooks/useTeamInvitationActions'
import { useTeamInvitesReceived, useTeamInvitesSent } from '../invitations/hooks/useTeamInvitationSelectors'

import { TeamInvitationsSection } from '../components/TeamInvitationsSection'

const TeamInvitationsPageContent = () => {

  useTeamInvitationsFlow()

  const invitesReceived = useTeamInvitesReceived()
  const invitesSent = useTeamInvitesSent()
  const { acceptInvitation, rejectInvitation } = useTeamInvitationActions()

  return (
    <div className="flex h-full w-full flex-col gap-6">
      <TeamInvitationsSection
        invitesReceived={invitesReceived}
        invitesSent={invitesSent}
        onAccept={acceptInvitation}
        onReject={rejectInvitation}
      />
    </div>
  )
}

export const TeamInvitationsPage = (_: StackComponentProps<undefined>) => (
  <TeamProvider>
    <TeamInvitationsPageContent />
  </TeamProvider>
)
