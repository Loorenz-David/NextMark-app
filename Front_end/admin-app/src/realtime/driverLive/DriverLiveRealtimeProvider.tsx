import type { PropsWithChildren } from 'react'
import { useEffect, useMemo, useSyncExternalStore } from 'react'
import { createDriverLiveChannel } from '@shared-realtime'
import { sessionStorage } from '@/features/auth/login/store/sessionStorage'
import { adminRealtimeClient } from '../client'
import { useDriverLiveStore } from './driverLive.store'

const resolveTeamId = () => {
  const session = sessionStorage.getSession()
  const rawTeamId = session?.identity?.active_team_id ?? session?.user?.teamId ?? null
  const numericTeamId = Number(rawTeamId)
  return Number.isFinite(numericTeamId) ? numericTeamId : null
}

export function DriverLiveRealtimeProvider({ children }: PropsWithChildren) {
  const session = useSyncExternalStore(
    sessionStorage.subscribe.bind(sessionStorage),
    () => sessionStorage.getSession(),
    () => sessionStorage.getSession(),
  )

  const driverLiveChannel = useMemo(
    () => createDriverLiveChannel(adminRealtimeClient),
    [],
  )

  useEffect(() => {
    const socketToken = session?.socketToken ?? null
    const teamId = resolveTeamId()

    if (!socketToken || teamId == null) {
      useDriverLiveStore.getState().clear()
      return
    }

    const release = driverLiveChannel.subscribeTeamDriverLive({
      onSnapshot: (payload) => {
        useDriverLiveStore.getState().setSnapshot(payload.positions ?? [])
      },
      onUpdated: (payload) => {
        useDriverLiveStore.getState().upsertPosition(payload)
      },
    })

    return () => {
      release()
    }
  }, [driverLiveChannel, session])

  return <>{children}</>
}
