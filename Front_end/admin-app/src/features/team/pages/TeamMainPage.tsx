import {useEffect} from 'react'
import type { StackComponentProps } from '@/shared/stack-manager/types'

import { TeamProvider } from '../context/TeamProvider'

import { useTeamMemberActions } from '../hooks/useTeamMemberActions'
import { useTeamMemberMeta } from '../hooks/useTeamMemberMeta'
import { useTeamNameEditor } from '../hooks/useTeamNameEditor'
import { filterTeamMembers } from '../domain/useTeamMemberRules'
import type { TeamMemberFilterKey } from '../types/teamMemberFilters'
import { useTeamMembers } from '../members/hooks/useTeamMemberSelectors'

import type { SearchBarValue } from '@/shared/buttons/SearchBar'

import { TeamMembersSection } from '../components/TeamMembersSection'
import { useTeamMembersFlow } from '../hooks/useTeamMembersFlow'

const TeamMainPageContent = () => {

  const members = useTeamMembers()
  const { openInvitePopup, kickMember, leaveCurrentTeam, canKickMember } = useTeamMemberActions()
  const { teamName } = useTeamMemberMeta()
  const teamNameEditor = useTeamNameEditor(teamName)
  const { loadMembers } = useTeamMembersFlow()
  const handleSearch = (value: SearchBarValue) => {
    const filterKeys = value.filters as TeamMemberFilterKey[]
    const filtered = filterTeamMembers(members, value.input, filterKeys)
    return filtered
  }

  useEffect(()=>{
    loadMembers()
  },[])

  return (
    <div className="flex h-full w-full flex-col gap-6">
      <TeamMembersSection
        members={members}
        onInvite={openInvitePopup}
        onSearch={handleSearch}
        onKick={kickMember}
        onLeave={leaveCurrentTeam}
        canKickMember={canKickMember}
        teamName={teamName}
        teamNameEditor={teamNameEditor}
      />
    </div>
  )
}

export const TeamMainPage = (_: StackComponentProps<undefined>) => (
  <TeamProvider>
    <TeamMainPageContent />
  </TeamProvider>
)
