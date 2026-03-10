import { BoldCheckIcon, CloseIcon, EditIcon } from '@/assets/icons'

import type { TeamNameEditor } from '@/features/team/types/teamNameEditor'

type TeamNameEditorRowProps = {
  teamName: string | null
  teamNameEditor: TeamNameEditor
}

export const TeamNameEditorRow = ({
  teamName,
  teamNameEditor,
}: TeamNameEditorRowProps) => {
  if (!teamName) return null

  const {
    isEditing,
    draftName,
    startEdit,
    cancelEdit,
    updateDraft,
    confirmEdit,
  } = teamNameEditor

  return (
    <div className="flex items-center gap-2 pt-1">
      {isEditing ? (
        <>
          <input
            className="rounded-md border border-[var(--color-muted)]/50 bg-white px-2 py-1 text-xs text-[var(--color-text)]"
            value={draftName}
            onChange={(event) => updateDraft(event.target.value)}
            placeholder="Team name"
            style={{border:'1px solid gray'}}
          />
          <button
            className="flex h-6 w-6 items-center justify-center rounded-full border border-[var(--color-muted)]/40 text-[var(--color-blue-500)]"
            onClick={confirmEdit}
            type="button"
            aria-label="Confirm team name"
          >
            <BoldCheckIcon className="h-3.5 w-3.5" />
          </button>
          <button
            className="flex h-6 w-6 items-center justify-center rounded-full border border-[var(--color-muted)]/40 text-[var(--color-muted)]"
            onClick={cancelEdit}
            type="button"
            aria-label="Cancel team name edit"
          >
            <CloseIcon className="h-3.5 w-3.5" />
          </button>
        </>
      ) : (
        <>
          <p className="text-xs text-[var(--color-blue-500)]">Team: {teamName}</p>
          <button
            className="flex h-6 w-6 items-center justify-center rounded-full border border-[var(--color-muted)]/40 text-[var(--color-muted)]"
            onClick={startEdit}
            type="button"
            aria-label="Edit team name"
          >
            <EditIcon className="h-3.5 w-3.5" />
          </button>
        </>
      )}
    </div>
  )
}
