import { getLocal, setLocal } from "@/lib/ls";
import { PlayerId, playerIdSchema } from "@/shared/schemas/playerIdSchema";
import { generateFunnyPlayerId } from "@/shared/utils/generatePlayerId";
import { useSyncExternalStore } from "react";

const PLAYER_ID_KEY = "playerId";

function getPlayerIdSnapshot(): PlayerId | null {
  if (typeof window === "undefined") return null;

  const existing = getLocal<string>(PLAYER_ID_KEY);

  if (existing) {
    const parsed = playerIdSchema.safeParse(existing);
    if (parsed.success) return parsed.data;
  }

  // No valid ID exists, create one
  const newId = generateFunnyPlayerId();
  setLocal(PLAYER_ID_KEY, newId);
  return newId as PlayerId;
}

function getServerSnapshot(): PlayerId | null {
  return null;
}

function subscribe(callback: () => void): () => void {
  // Listen for storage changes from other tabs
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
}

/**
 * Hook to get or create a player ID. Must be used in a client component.
 * Returns null during SSR, then the actual ID after hydration.
 */
export function usePlayerIdentity(): PlayerId | null {
  return useSyncExternalStore(
    subscribe,
    getPlayerIdSnapshot,
    getServerSnapshot
  );
}
