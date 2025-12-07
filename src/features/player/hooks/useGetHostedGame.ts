"use client";

import { trpc } from "@/external/trpc/client";
import { usePlayerIdentity } from "./usePlayerIdentity";

/**
 * Hook to check if the current user is hosting an active game.
 * Returns the game ID and code if they are hosting, null otherwise.
 */
export function useGetHostedGame() {
  const playerId = usePlayerIdentity();

  const { data: game, isLoading } = trpc.player.getActiveHostedGames.useQuery(
    { playerId: playerId ?? "" },
    {
      enabled: !!playerId,
    }
  );

  return {
    isHosting: !!game,
    gameId: game?.id ?? null,
    gameCode: game?.code ?? null,
    isLoading: isLoading || !playerId,
  };
}
