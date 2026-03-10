import { MemberSelectorLayout } from './MemberSelector.layout'
import { MemberSelectorProvider } from './MemberSelector.provider'
import type { MemberSelectorProps } from './MemberSelector.types'

export const MemberSelector = ({ selectedMember, onSelectMember }: MemberSelectorProps) => {
  return (
    <MemberSelectorProvider selectedMember={selectedMember} onSelectMember={onSelectMember}>
      <MemberSelectorLayout />
    </MemberSelectorProvider>
  )
}
