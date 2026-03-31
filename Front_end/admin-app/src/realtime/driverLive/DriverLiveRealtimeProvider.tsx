import type { PropsWithChildren } from "react";
import { useEffect, useMemo, useSyncExternalStore } from "react";
import { createDriverLiveChannel } from "@shared-realtime";
import type { DriverLocationUpdatedPayload } from "@shared-realtime";
import { sessionStorage } from "@/features/auth/login/store/sessionStorage";
import { adminRealtimeClient } from "../client";
import { useDriverLiveStore } from "./driverLive.store";

const resolveTeamId = () => {
  const session = sessionStorage.getSession();
  const rawTeamId =
    session?.identity?.active_team_id ?? session?.user?.teamId ?? null;
  const numericTeamId = Number(rawTeamId);
  return Number.isFinite(numericTeamId) ? numericTeamId : null;
};

const buildDevSeedDriverPositions = (
  teamId: number,
): DriverLocationUpdatedPayload[] => {
  const recordedAt = new Date().toISOString();

  return [
    {
      driver_id: 1,
      team_id: teamId,
      coords: { lat: 59.33258, lng: 18.0649 },
      timestamp: recordedAt,
    },
    {
      driver_id: 102,
      team_id: teamId,
      coords: { lat: 59.32893, lng: 18.07112 },
      timestamp: recordedAt,
    },
    {
      driver_id: 103,
      team_id: teamId,
      coords: { lat: 59.33621, lng: 18.05847 },
      timestamp: recordedAt,
    },
  ];
};

export function DriverLiveRealtimeProvider({ children }: PropsWithChildren) {
  const session = useSyncExternalStore(
    sessionStorage.subscribe.bind(sessionStorage),
    () => sessionStorage.getSession(),
    () => sessionStorage.getSession(),
  );

  const driverLiveChannel = useMemo(
    () => createDriverLiveChannel(adminRealtimeClient),
    [],
  );

  useEffect(() => {
    const socketToken = session?.socketToken ?? null;
    const teamId = resolveTeamId();

    if (!socketToken || teamId == null) {
      useDriverLiveStore.getState().clear();
      return;
    }

    const release = driverLiveChannel.subscribeTeamDriverLive({
      onSnapshot: (payload) => {
        useDriverLiveStore.getState().setSnapshot(payload.positions ?? []);
      },
      onUpdated: (payload) => {
        useDriverLiveStore.getState().upsertPosition(payload);
      },
    });

    return () => {
      release();
    };
  }, [driverLiveChannel, session]);

  useEffect(() => {
    const teamId = resolveTeamId();

    if (!import.meta.env.DEV || teamId == null) {
      return;
    }

    useDriverLiveStore
      .getState()
      .setSnapshot(buildDevSeedDriverPositions(teamId));
  }, []);

  return <>{children}</>;
}
