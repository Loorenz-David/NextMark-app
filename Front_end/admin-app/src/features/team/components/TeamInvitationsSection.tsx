import type { TeamInviteReceived, TeamInviteSent } from '@/features/team/invitations/types/teamInvitation'

import { TeamInvitationCard } from './TeamInvitationCard'

type TeamInvitationsSectionProps = {
  invitesReceived: TeamInviteReceived[]
  invitesSent: TeamInviteSent[]
  onAccept: (inviteId: number) => void
  onReject: (inviteId: number) => void
}

export const TeamInvitationsSection = ({
  invitesReceived,
  invitesSent,
  onAccept,
  onReject,
}: TeamInvitationsSectionProps) => {
 
  return(
  <section className="flex flex-col gap-10 p-6">
    <div>
      <h2 className="text-base font-semibold text-[var(--color-text)]">Invitations</h2>
      <p className="text-xs text-[var(--color-muted)]">Pending invites for your team.</p>
    </div>

    <div className="flex flex-col gap-3">
      <h3 className="text-sm font-semibold text-[var(--color-text)]">Received</h3>
      {invitesReceived.map((invite) => (
        <TeamInvitationCard
          key={invite.client_id}
          invite={invite}
          variant="received"
          onAccept={onAccept}
          onReject={onReject}
        />
      ))}
      {!invitesReceived.length ? (
        <p className="text-sm text-[var(--color-muted)]">No received invitations.</p>
      ) : null}
    </div>

    <div className="flex flex-col gap-3 ">
      <h3 className="text-sm font-semibold text-[var(--color-text)]">Sent</h3>
      {invitesSent.map((invite) => (
        <TeamInvitationCard
          key={invite.client_id}
          invite={invite}
          variant="sent"
        />
      ))}
      {!invitesSent.length ? (
        <p className="text-sm text-[var(--color-muted)]">No sent invitations.</p>
      ) : null}
    </div>
  </section>
)}
