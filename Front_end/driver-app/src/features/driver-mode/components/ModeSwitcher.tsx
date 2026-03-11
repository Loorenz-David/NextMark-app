import { useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import type { DriverBaseRole } from '@/app/contracts/driverSession.types'
import { useWorkspace } from '@/app/providers/workspace.context'

export function ModeSwitcher() {
  const { workspace, isSwitchingMode, switchError, switchMode } = useWorkspace()
  const [targetRole, setTargetRole] = useState<DriverBaseRole>(workspace?.baseRole ?? 'team-driver')
  const [targetTeamId, setTargetTeamId] = useState(workspace?.teamId ?? '')

  const helperText = useMemo(() => (
    targetRole === 'independent-driver'
      ? 'Independent mode can expose quick route and order creation.'
      : 'Team mode restricts creation and focuses on assigned route execution.'
  ), [targetRole])

  if (!workspace?.capabilities.canSwitchMode) {
    return null
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    await switchMode({
      targetBaseRole: targetRole,
      targetTeamId: targetTeamId.trim() || null,
    })
  }

  return (
    <section className="mode-switcher">
      <div>
        <div className="driver-kicker">Driver mode</div>
        <strong>{workspace.baseRole}</strong>
        <p className="driver-subtitle">{helperText}</p>
      </div>

      <form className="mode-switcher__form" onSubmit={handleSubmit}>
        <select value={targetRole} onChange={(event) => setTargetRole(event.target.value as DriverBaseRole)}>
          <option value="team-driver">Team driver</option>
          <option value="independent-driver">Independent driver</option>
        </select>
        <input
          placeholder="Target team id"
          value={targetTeamId}
          onChange={(event) => setTargetTeamId(event.target.value)}
        />
        <button className="primary-button" type="submit" disabled={isSwitchingMode}>
          {isSwitchingMode ? 'Switching…' : 'Switch workspace'}
        </button>
      </form>

      {switchError ? <p className="form-error">{switchError}</p> : null}
    </section>
  )
}
